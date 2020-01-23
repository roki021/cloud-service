package rest;

import beans.User;
import com.google.gson.Gson;
import controler.CloudServiceControler;
import spark.Request;
import spark.Session;

import java.io.File;
import java.io.IOException;

import static spark.Spark.*;

public class CloudServiceApp {

    private static CloudServiceControler cloudService = new CloudServiceControler();
    private static Gson g = new Gson();

    public static void main(String[] args) throws IOException {
        port(8080);

        staticFiles.externalLocation(new File("./static").getCanonicalPath());

        /* ********************* AUTHORIZATION AND LOADING PAGES ********************* */

        post("/rest/logIn", (req, res) -> {
            res.type("application/json");
            User user = null;
            boolean logIn = false;
            try {
                user = g.fromJson(req.body(), User.class);
                Session ss = req.session(true);
                User sessionUser = ss.attribute("user");

                if(sessionUser == null) {
                    if(cloudService.checkUserCredentials(user)) {
                        sessionUser = cloudService.getUser(user.getEmail());
                        ss.attribute("user", sessionUser);
                        logIn = true;
                    }
                }
            } catch(Exception ex) {}

            return "{\"loggedIn\": " + logIn + "}";
        });

        get("/rest/isLogged", (req, res) -> {
            res.type("application/json");

            return "{\"isLogged\": " + isUserLoggedIn(req) + "}";
        });

        get("/rest/logOut", (req, res) -> {
            res.type("application/json");
            Session ss = req.session();
            User user = ss.attribute("user");
            boolean logOut = false;

            if(user != null) {
                ss.invalidate();
                logOut = true;
            }

            return "{\"loggedOut\": " + logOut + "}";
        });

        /* ********************* WORKING WITH USERS ********************* */

        get("/rest/getUsers", (req, res) -> {
           res.type("application/json");
           Session ss = req.session();
           User user = ss.attribute("user");

           if(user == null) {
               res.status(403);
               return "{\"access\": Unauthorized}";
           }
           else if(user.getRole() == User.Role.SUPER_ADMIN) {
               return g.toJson(cloudService.getAllUsers());
           }
           else if(user.getRole() == User.Role.ADMIN) {
                return g.toJson(cloudService.getUsers(user.getOrganization()));
           }
           else {
               res.status(403);
               return "{\"access\": Unauthorized}";
           }
        });

        get("/rest/getUserRole", (req, res) -> {
            res.type("application/json");
            Session ss = req.session();
            User user = ss.attribute("user");

            if(user == null) {
                return "{\"currentUser\": \"none\"}";
            }
            else if(user.getRole() == User.Role.SUPER_ADMIN) {
                return "{\"currentUser\": \"SUPER_ADMIN\"}";
            }
            else if(user.getRole() == User.Role.ADMIN) {
                return "{\"currentUser\": \"ADMIN\"}";
            }
            else {
                return "{\"currentUser\": \"USER\"}";
            }
        });

        get("/rest/addUser", (req, res) -> {
            res.type("application/json");
            Session ss = req.session();
            User user = ss.attribute("user");

            if(user == null) {
                res.status(403);
                return "{\"access\": Unauthorized}";
            }
            else if(user.getRole() == User.Role.SUPER_ADMIN) {
                return g.toJson(cloudService.getAllUsers());
            }
            else if(user.getRole() == User.Role.ADMIN) {
                return g.toJson(cloudService.getUsers(user.getOrganization()));
            }
            else {
                res.status(403);
                return "{\"access\": Unauthorized}";
            }
        });

        get("/rest/removeUser", (req, res) -> {
            res.type("application/json");
            Session ss = req.session();
            User user = ss.attribute("user");
            String email = req.queryParams("email");
            String success = "false";

            if(user == null) {
                res.status(403);
                success = "false";
            }
            else if(user.getRole() == User.Role.SUPER_ADMIN) {
                cloudService.removeUser(email);
                success = "true";
            }
            else if(user.getRole() == User.Role.ADMIN) {
                if(cloudService.getUser(email).getOrganization().equals(user.getOrganization())) {
                    cloudService.removeUser(email);
                    success = "true";
                }
                success = "false";
            }
            else {
                res.status(403);
                success = "false";
            }

            return "{\"success\": " + success + "}";
        });
    }

    public static boolean isUserLoggedIn(Request req) {
        Session ss = req.session(true);
        User loggedUser = ss.attribute("user");

        return loggedUser != null;
    }
}

package rest;

import beans.Organization;
import beans.User;
import com.google.gson.Gson;
import controler.CloudServiceControler;
import spark.Request;
import spark.Response;
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

            return g.toJson(isUserLoggedIn(req));
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

        /* ********************* WORKING WITH ORGANIZATIONS ********************* */

        get("/rest/getOrgs", (req, res) -> {
            res.type("application/json");
            User user = isUserLoggedIn(req);

            if(user != null) {
                if(user.getRole() == User.Role.SUPER_ADMIN) {
                    return g.toJson(cloudService.getAllOrganizations());
                }
            }

            return responseStatus(res, 403, "Unauthorized access");
        });

        post("/rest/addOrg", (req, res) -> {
            res.type("application/json");
            Organization org = null;
            try {
                org = g.fromJson(req.body(), Organization.class);
            } catch(Exception ex) {}
            User user = isUserLoggedIn(req);

            if(user != null) {
                if(user.getRole() == User.Role.SUPER_ADMIN) {
                    cloudService.extractImageFromBytes(org);
                    return "{\"added\":" + cloudService.addOrganization(org) + "}";
                }
            }

            return responseStatus(res, 403, "Unauthorized access");
        });

        post("/rest/getOrg", (req, res) -> {
            res.type("application/json");
            Session ss = req.session(true);
            Organization org = null;
            try {
                org = g.fromJson(req.body(), Organization.class);
                ss.attribute("orgToChange", org.getName());
            } catch(Exception ex) {}
            User user = isUserLoggedIn(req);

            if(user != null) {
                if(user.getRole() == User.Role.SUPER_ADMIN) {
                    if(org != null) {
                        return g.toJson(cloudService.getOrganization(org.getName()));
                    }
                    else {
                        return responseStatus(res, 400, "Bad request");
                    }
                }
            }

            return responseStatus(res, 403, "Unauthorized access");
        });

        post("/rest/editOrg", (req, res) -> {
            res.type("application/json");
            Organization org = null;
            try {
                org = g.fromJson(req.body(), Organization.class);
            } catch(Exception ex) {}
            User user = isUserLoggedIn(req);

            if(user != null) {
                if(user.getRole() == User.Role.SUPER_ADMIN) {
                    String key = req.session(true).attribute("orgToChange");

                    if(key != null) {
                        return "{\"added\":" + cloudService.changeOrganization(key, org) + "}";
                    }
                }
                else if(user.getRole() == User.Role.ADMIN) {
                    if(user.getOrganization() != null) {
                        return "{\"added\":" + cloudService.changeOrganization(user.getOrganization(), org) + "}";
                    }
                }
            }

            return responseStatus(res, 403, "Unauthorized access");
        });

        get("/rest/getUserOrg", (req, res) -> {
            res.type("application/json");
            User user = isUserLoggedIn(req);

            if(user != null) {
                return g.toJson(cloudService.getOrganization(user.getOrganization()));
            }

            return responseStatus(res, 403, "Unauthorized access");
        });
    }

    public static User isUserLoggedIn(Request req) {
        Session ss = req.session(true);
        User loggedUser = ss.attribute("user");

        return loggedUser;
    }

    public static String responseStatus(Response res, int code, String message) {
        res.status(code);
        return "{\"message\": " + message + "}";
    }
}

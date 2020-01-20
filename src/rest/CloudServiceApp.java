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

        post("/rest/logIn", (req, res) -> {
            res.type("application/json");
            User user = null;
            boolean resMsg = false;
            try {
                user = g.fromJson(req.body(), User.class);
                Session ss = req.session(true);
                User sessionUser = ss.attribute("user");

                if(sessionUser == null) {
                    if(cloudService.checkUserCredentials(user)) {
                        sessionUser = cloudService.getUser(user.getEmail());
                        ss.attribute("user", sessionUser);
                        resMsg = true;
                    }
                }
            } catch(Exception ex) {}

            return "{\"loggedIn\": " + resMsg + "}";
        });

        get("/rest/isLogged", (req, res) -> {
            res.type("application/json");

            return "{\"isLogged\": " + isUserLoggedIn(req) + "}";
        });
    }

    public static boolean isUserLoggedIn(Request req) {
        Session ss = req.session(true);
        User loggedUser = ss.attribute("user");

        return loggedUser != null;
    }
}

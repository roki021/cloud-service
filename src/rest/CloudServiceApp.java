package rest;

import beans.*;
import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import controler.CloudServiceControler;
import spark.Request;
import spark.Response;
import spark.Session;

import java.io.File;
import java.io.IOException;

import static spark.Spark.*;

public class CloudServiceApp {

    private static final String MSG_400 = "Bad Request";
    private static final String MSG_403 = "Forbidden";

    private static CloudServiceControler cloudService = new CloudServiceControler();
    private static Gson g = new Gson();

    public static void main(String[] args) throws IOException {
        port(8080);

        staticFiles.externalLocation(new File("./static").getCanonicalPath());

        /* ********************* AUTHORIZATION AND LOADING PAGES ********************* */

        post("/rest/logIn", (req, res) -> {
            res.type("application/json");
            User user;
            boolean logIn = false;
            try {
                user = g.fromJson(req.body(), User.class);
                Session ss = req.session(true);
                User sessionUser = ss.attribute("user");

                if (sessionUser == null) {
                    if (cloudService.checkUserCredentials(user)) {
                        sessionUser = cloudService.getUser(user.getEmail());
                        ss.attribute("user", sessionUser);
                        logIn = true;
                    }
                }
            } catch (Exception ex) {
                return responseStatus(res, 400, MSG_400);
            }

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

            if (user != null) {
                ss.invalidate();
                logOut = true;
            }

            return "{\"loggedOut\": " + logOut + "}";
        });

        get("/rest/getProfile", (req, res) -> {
           res.type("application/json");
           User user = isUserLoggedIn(req);

           if(user != null) {
               return g.toJson(user);
           }

           return responseStatus(res, 403, MSG_403);
        });

        post("/rest/editProfile", (req, res) -> {
            res.type("application/json");
            User changed;
            try {
                changed = g.fromJson(req.body(), User.class);
            } catch (Exception ex) {
                return responseStatus(res, 400, MSG_400);
            }
            User user = isUserLoggedIn(req);

            if(user != null) {
                return "{\"changed\": " + cloudService.changeProfile(user, changed) + "}";
            }

            return responseStatus(res, 403, MSG_403);
        });

        post("/rest/changePassword", (req, res) -> {
            res.type("application/json");
            PasswordChange newPass;
            try {
                newPass = g.fromJson(req.body(), PasswordChange.class);
            } catch (Exception ex) {
                return responseStatus(res, 400, "Bad arguments");
            }
            User user = isUserLoggedIn(req);

            if(user != null) {
                return "{\"changed\": " + cloudService.changePassword(user, newPass) + "}";
            }

            return responseStatus(res, 403, "Unauthorized access");
        });

        /* ********************* WORKING WITH USERS ********************* */

        get("/rest/getUsers", (req, res) -> {
            res.type("application/json");
            Session ss = req.session();
            User user = ss.attribute("user");

            if (user == null) {
                res.status(403);
                return "{\"access\": Unauthorized}";
            } else if (user.getRole() == User.Role.SUPER_ADMIN) {
                return g.toJson(cloudService.getAllUsers());
            } else if (user.getRole() == User.Role.ADMIN) {
                return g.toJson(cloudService.getUsers(user.getOrganization()));
            } else {
                res.status(403);
                return "{\"access\": Unauthorized}";
            }
        });

        post("/rest/getUser", (req, res) -> {
            res.type("application/json");
            Session ss = req.session();
            User user = ss.attribute("user");
            User u;
            String email;
            try {
                u = g.fromJson(req.body(), User.class);
                email = u.getEmail();
            } catch (Exception ex) {
                return responseStatus(res, 400, MSG_400);
            }

            if (user == null) {
                res.status(403);
                return "{\"access\": Unauthorized}";
            } else if (user.getRole() == User.Role.SUPER_ADMIN) {
                u = cloudService.getUser(email);
                if (u != null) {
                    return g.toJson(u);
                } else {
                    res.status(404);
                    return "{\"user\": \"not found\"}";
                }
            } else if (user.getRole() == User.Role.ADMIN) {
                u = cloudService.getUser(email);
                if (u != null) {
                    if (u.getOrganization().equals(user.getOrganization()))
                        return g.toJson(u);
                    else {
                        res.status(403);
                        return "{\"access\": Unauthorized}";
                    }
                } else {
                    res.status(404);
                    return "{\"user\": \"not found\"}";
                }
            } else {
                res.status(403);
                return "{\"access\": Unauthorized}";
            }
        });

        get("/rest/getUserRole", (req, res) -> {
            res.type("application/json");
            Session ss = req.session();
            User user = ss.attribute("user");

            if (user == null) {
                return "{\"currentUser\": \"none\"}";
            } else if (user.getRole() == User.Role.SUPER_ADMIN) {
                return "{\"currentUser\": \"SUPER_ADMIN\"}";
            } else if (user.getRole() == User.Role.ADMIN) {
                return "{\"currentUser\": \"ADMIN\"}";
            } else {
                return "{\"currentUser\": \"USER\"}";
            }
        });

        post("/rest/addUser", (req, res) -> {
            res.type("application/json");
            Session ss = req.session();
            User user = ss.attribute("user");
            boolean msg = false;

            if (user == null) {
                res.status(403);
            } else if (user.getRole() == User.Role.SUPER_ADMIN) {
                User u;
                try {
                    u = g.fromJson(req.body(), User.class);
                    if(!u.emptyFieldExists())
                        msg = cloudService.addUser(u);
                    else
                        res.status(400);
                } catch (Exception ex) {
                }
            } else if (user.getRole() == User.Role.ADMIN) {
                User u;
                try {
                    u = g.fromJson(req.body(), User.class);
                    u.setOrganization(user.getOrganization());
                    if(!u.emptyFieldExists())
                        msg = cloudService.addUser(u);
                    else
                        res.status(400);
                } catch (Exception ex) {
                }
            } else {
                res.status(403);
            }
            return "{\"added\": " + msg + "}";
        });

        post("/rest/editUser", (req, res) -> {
            res.type("application/json");
            Session ss = req.session();
            User user = ss.attribute("user");
            boolean success = false;

            if (user == null) {
                res.status(403);
            } else if (user.getRole() == User.Role.SUPER_ADMIN) {
                User u;
                try {
                    u = g.fromJson(req.body(), User.class);
                    User userEdit = cloudService.getUser(u.getEmail());
                    if (userEdit != null) {
                        u.setOrganization(userEdit.getOrganization());
                        u.setEmail(userEdit.getEmail());
                        if(!u.emptyFieldExists())
                            success = cloudService.changeUserCreditials(u);
                        else
                            res.status(400);
                    }
                } catch (Exception e) {
                    res.status(404);
                }
            } else if (user.getRole() == User.Role.ADMIN) {
                User u;
                try {
                    u = g.fromJson(req.body(), User.class);
                    User userEdit = cloudService.getUser(u.getEmail());
                    if (userEdit != null && userEdit.getOrganization().equals(user.getOrganization())) {
                        u.setOrganization(userEdit.getOrganization());
                        u.setEmail(userEdit.getEmail());
                        if(!u.emptyFieldExists())
                            success = cloudService.changeUserCreditials(u);
                        else
                            res.status(400);
                    }
                } catch (Exception e) {
                    res.status(404);
                }
            } else {
                res.status(403);
            }
            return "{\"success\": " + success + "}";
        });

        post("/rest/removeUser", (req, res) -> {
            res.type("application/json");
            Session ss = req.session();
            User user = ss.attribute("user");
            User u = null;
            String email = "";
            try {
                 u = g.fromJson(req.body(), User.class);
                email = u.getEmail();
            } catch (Exception ex) {}
            boolean success = false;

            if (user == null) {
                res.status(403);
            } else if (email.equals("")) {
                res.status(400);
            } else if (user.getRole() == User.Role.SUPER_ADMIN) {
                if (user.getEmail().equals(email)) {
                    res.status(400);
                } else {
                    u = cloudService.removeUser(email);
                    if(u != null)
                        success = true;
                }
            } else if (user.getRole() == User.Role.ADMIN) {
                if (user.getEmail().equals(email)) {
                    res.status(400);
                } else {
                    if (cloudService.getUser(email).getOrganization().equals(user.getOrganization())) {
                        u = cloudService.removeUser(email);
                        if(u != null)
                            success = true;
                    }
                }
            } else {
                res.status(403);
            }

            return "{\"success\": " + success + "}";
        });

        /* ********************* WORKING WITH ORGANIZATIONS ********************* */

        get("/rest/getOrgs", (req, res) -> {
            res.type("application/json");
            User user = isUserLoggedIn(req);

            if (user != null) {
                if (user.getRole() == User.Role.SUPER_ADMIN) {
                    return g.toJson(cloudService.getAllOrganizations());
                }
            }

            return responseStatus(res, 403, MSG_403);
        });

        post("/rest/addOrg", (req, res) -> {
            res.type("application/json");
            Organization org;
            try {
                org = g.fromJson(req.body(), Organization.class);
            } catch (Exception ex) {
                return responseStatus(res, 400, MSG_400);
            }
            User user = isUserLoggedIn(req);

            if (user != null) {
                if (user.getRole() == User.Role.SUPER_ADMIN) {
                    return "{\"added\":" + cloudService.addOrganization(org) + "}";
                }
            }

            return responseStatus(res, 403, MSG_403);
        });

        post("/rest/getOrg", (req, res) -> {
            res.type("application/json");
            Session ss = req.session(true);
            Organization org;
            try {
                org = g.fromJson(req.body(), Organization.class);
                ss.attribute("orgToChange", org.getName());
            } catch (Exception ex) {
                return responseStatus(res, 400, MSG_400);
            }
            User user = isUserLoggedIn(req);

            if (user != null) {
                if (user.getRole() == User.Role.SUPER_ADMIN) {
                    return g.toJson(cloudService.getOrganization(org.getName()));
                }
            }

            return responseStatus(res, 403, MSG_403);
        });

        post("/rest/editOrg", (req, res) -> {
            res.type("application/json");
            Organization org;
            try {
                org = g.fromJson(req.body(), Organization.class);
            } catch (Exception ex) {
                return responseStatus(res, 400, MSG_400);
            }
            User user = isUserLoggedIn(req);

            if (user != null) {
                if (user.getRole() == User.Role.SUPER_ADMIN) {
                    String key = req.session(true).attribute("orgToChange");

                    if (key != null) {
                        return "{\"added\":" + cloudService.changeOrganization(key, org) + "}";
                    }
                } else if (user.getRole() == User.Role.ADMIN) {
                    if (user.getOrganization() != null) {
                        return "{\"added\":" + cloudService.changeOrganization(user.getOrganization(), org) + "}";
                    }
                }
            }

            return responseStatus(res, 403, "Unauthorized access");
        });

        get("/rest/getUserOrg", (req, res) -> {
            res.type("application/json");
            User user = isUserLoggedIn(req);

            if (user != null) {
                return g.toJson(cloudService.getOrganization(user.getOrganization()));
            }

            return responseStatus(res, 403, "Unauthorized access");
        });

        /* ********************* WORKING WITH VIRTUAL MACHINES ********************* */

        get("/rest/getVMs", (req, res) -> {
            res.type("application/json");
            Session ss = req.session(true);
            User user = ss.attribute("user");

            if (user != null) {
                if (user.getRole() == User.Role.SUPER_ADMIN) {
                    JsonArray array = new JsonArray();
                    for (VM vm : cloudService.getAllVMs()) {
                        JsonObject v = new JsonObject();
                        v.addProperty("name", vm.getName());
                        v.addProperty("cores", cloudService.getVMCategory(vm.getCategoryName()).getCores());
                        v.addProperty("ram", cloudService.getVMCategory(vm.getCategoryName()).getRam());
                        v.addProperty("gpu", cloudService.getVMCategory(vm.getCategoryName()).getGpuCores());
                        v.addProperty("organization", vm.getOrganizationName());
                        array.add(v);
                    }

                    return array;
                } else {
                    JsonArray array = new JsonArray();
                    for (VM vm : cloudService.getAllVMs()) {
                        if(vm.getOrganizationName().equals(user.getOrganization())) {
                            JsonObject v = new JsonObject();
                            v.addProperty("name", vm.getName());
                            v.addProperty("cores", cloudService.getVMCategory(vm.getCategoryName()).getCores());
                            v.addProperty("ram", cloudService.getVMCategory(vm.getCategoryName()).getRam());
                            v.addProperty("gpu", cloudService.getVMCategory(vm.getCategoryName()).getGpuCores());
                            array.add(v);
                        }
                    }

                    return array;
                }
            }

            return responseStatus(res, 403, "Unauthorized access");
        });

        post("/rest/getOrgVMs", (req, res) -> {
            res.type("application/json");
            User user = isUserLoggedIn(req);
            Organization org;
            try {
                org = g.fromJson(req.body(), Organization.class);
            } catch (Exception ex) {
                return responseStatus(res, 400, MSG_400);
            }

            if(user != null) {
                if(user.getRole() == User.Role.SUPER_ADMIN) {
                    return g.toJson(cloudService.getVMs(org.getName()));
                }
            }

            return responseStatus(res, 403, MSG_403);
        });

        post("/rest/getVM", (req, res) -> {
            res.type("application/json");
            Session ss = req.session(true);
            VM vm = null;
            try {
                vm = g.fromJson(req.body(), VM.class);
                ss.attribute("vmToChange", vm.getName());
            } catch (Exception ex) {
            }
            User user = isUserLoggedIn(req);

            if (user != null) {
                if (user.getRole() == User.Role.SUPER_ADMIN) {
                    if (vm != null) {
                        return g.toJson(cloudService.getVM(vm.getName()));
                    } else {
                        return responseStatus(res, 400, "Bad request");
                    }
                } else {
                    if (vm != null) {
                        if(cloudService.getVM(vm.getName()).getOrganizationName().equals(user.getOrganization())) {
                            return g.toJson(cloudService.getVM(vm.getName()));
                        }
                        else {
                            return responseStatus(res, 403, "Unauthorized access");
                        }
                    }
                    else {
                        return responseStatus(res, 400, "Bad request");
                    }
                }
            }

            return responseStatus(res, 403, "Unauthorized access");
        });

        post("/rest/addVM", (req, res) -> {
            res.type("application/json");
            VM vm = null;
            try {
                vm = g.fromJson(req.body(), VM.class);

            } catch (Exception ex) {
            }
            if(vm.getName().equals(""))
                return "{\"added\": false}";
            Session ss = req.session(true);
            User user = ss.attribute("user");

            if (user != null) {
                if (user.getRole() == User.Role.SUPER_ADMIN) {

                    boolean success = cloudService.addVM(vm);
                    if(success) {
                        cloudService.addOrganizationResource(vm.getOrganizationName(), vm.getName());
                        cloudService.setUsingDiscs(vm.getAttachedDiscs(), vm.getName());
                    }

                    return "{\"added\":" + success + "}";
                }
                else if (user.getRole() == User.Role.ADMIN) {
                    vm.setOrganizationName(user.getOrganization());
                    boolean success = cloudService.addVM(vm);
                    if(success) {
                        cloudService.addOrganizationResource(user.getOrganization(), vm.getName());
                        cloudService.setUsingDiscs(vm.getAttachedDiscs(), vm.getName());
                    }

                    return "{\"added\":" + success + "}";
                }
            }

            return responseStatus(res, 403, "Unauthorized access");
        });

        post("/rest/editVM", (req, res) -> {
            res.type("application/json");
            VM vm = null;
            try {
                vm = g.fromJson(req.body(), VM.class);
            } catch (Exception ex) {
                return responseStatus(res, 400, "Bad request");
            }
            User user = isUserLoggedIn(req);


            if (user != null) {
                String key = req.session(true).attribute("vmToChange");
                vm.setOrganizationName(cloudService.getVM(key).getOrganizationName());
                if (user.getRole() == User.Role.SUPER_ADMIN) {
                    if (key != null) {
                        return "{\"added\":" + cloudService.changeVM(key, vm) + "}";
                    }
                }
                else if (user.getRole() == User.Role.ADMIN) {
                    if (key != null) {
                        if(cloudService.getVM(key).getOrganizationName().equals(user.getOrganization()))
                            return "{\"added\":" + cloudService.changeVM(key, vm) + "}";
                        else
                            return responseStatus(res, 403, "Unauthorized access");
                    }
                }
            }

            return responseStatus(res, 403, "Unauthorized access");
        });

        post("/rest/removeVM", (req, res) -> {
            res.type("application/json");
            User user = isUserLoggedIn(req);
            VM vm = null;
            try {
                vm = g.fromJson(req.body(), VM.class);
            } catch (Exception ex) {}

            if (user != null) {
                if (user.getRole() == User.Role.SUPER_ADMIN) {
                    VM v = cloudService.removeVM(vm.getName());
                    if(v != null) {
                        cloudService.removeOrganizationResource(v.getOrganizationName(), v.getName());
                        cloudService.setNotUsingDiscs(v.getAttachedDiscs());
                    }
                    return "{\"deleted\":" + (v != null) + "}";
                }
                else if(user.getRole() == User.Role.ADMIN) {
                    if(cloudService.getVM(vm.getName()).getOrganizationName().equals(user.getOrganization())) {
                        VM v = cloudService.removeVM(vm.getName());
                        if (v != null) {
                            cloudService.removeOrganizationResource(v.getOrganizationName(), v.getName());
                            cloudService.setNotUsingDiscs(v.getAttachedDiscs());
                        }
                        return "{\"deleted\":" + (v != null) + "}";
                    }
                    else {
                        return responseStatus(res, 403, "Unauthorized access");
                    }
                }
            }

            return responseStatus(res, 403, "Unauthorized access");
        });

        /* ********************* WORKING WITH VM Categories ********************* */

        get("/rest/getVMCats", (req, res) -> {
            res.type("application/json");
            Session ss = req.session(true);
            User user = ss.attribute("user");

            if (user != null) {
                if (user.getRole() == User.Role.SUPER_ADMIN || user.getRole() == User.Role.ADMIN) {
                    return g.toJson(cloudService.getAllVMCategories());
                }
            }

            return responseStatus(res, 403, "Unauthorized access");
        });

        post("/rest/getVMCat2", (req, res) -> {
            res.type("application/json");
            Session ss = req.session(true);
            User user = ss.attribute("user");
            VMCategory cat = null;
            String name = "";
            try {
                cat = g.fromJson(req.body(), VMCategory.class);
                name = cat.getName();
            } catch (Exception ex) {}

            if (user != null) {
                if (user.getRole() != User.Role.USER) {
                    return g.toJson(cloudService.getVMCategory(name));
                }
            }

            return responseStatus(res, 403, "Unauthorized access");
        });

        post("/rest/getVMCat", (req, res) -> {
            res.type("application/json");
            Session ss = req.session(true);
            User user = ss.attribute("user");
            VMCategory cat = null;
            String name = "";
            try {
                cat = g.fromJson(req.body(), VMCategory.class);
                name = cat.getName();
            } catch (Exception ex) {}
            ss.attribute("catToChange", name);

            if (user != null) {
                if (user.getRole() == User.Role.SUPER_ADMIN) {
                    return g.toJson(cloudService.getVMCategory(name));
                }
            }

            return responseStatus(res, 403, "Unauthorized access");
        });

        post("/rest/removeCategory", (req, res) -> {
            res.type("application/json");
            Session ss = req.session();
            User user = ss.attribute("user");
            VMCategory cat = null;
            String name = "";
            try {
                cat = g.fromJson(req.body(), VMCategory.class);
                name = cat.getName();
            } catch (Exception ex) {}

            if (user != null) {
                if (user.getRole() == User.Role.SUPER_ADMIN) {
                    if (cloudService.removeVMCategory(name) == null)
                        return "{\"removed\": false}";
                    else
                        return "{\"removed\": true}";
                }
            }
            return responseStatus(res, 403, "Unauthorized access");
        });

        post("/rest/addVMCat", (req, res) -> {
            res.type("application/json");
            VMCategory cat = null;
            try {
                cat = g.fromJson(req.body(), VMCategory.class);
                if(cat.getName().equals(""))
                    return "{\"added\": false}";
            } catch (Exception ex) {
            }
            Session ss = req.session(true);
            User user = ss.attribute("user");

            if (user != null) {
                if (user.getRole() == User.Role.SUPER_ADMIN) {
                    return "{\"added\":" + cloudService.addVMCategory(cat) + "}";
                }
            }

            return responseStatus(res, 403, "Unauthorized access");
        });

        post("/rest/editVMCat", (req, res) -> {
            res.type("application/json");
            VMCategory cat = null;
            try {
                cat = g.fromJson(req.body(), VMCategory.class);
            } catch (Exception ex) {
            }
            Session ss = req.session(true);
            User user = ss.attribute("user");

            if (user != null) {
                if (user.getRole() == User.Role.SUPER_ADMIN) {
                    String key = ss.attribute("catToChange");
                    if (key != null) {
                        return "{\"success\":" + cloudService.changeVMCategory(key, cat) + "}";
                    }
                }
            }

            return responseStatus(res, 403, "Unauthorized access");
        });

        /* ********************* WORKING WITH DISCS ********************* */

        get("/rest/getDiscs", (req, res) -> {
            res.type("application/json");
            User user = isUserLoggedIn(req);

            if (user != null) {
                if (user.getRole() == User.Role.SUPER_ADMIN) {
                    return g.toJson(cloudService.getAllDiscs());
                } else {
                    return g.toJson(cloudService.getOrganizationDiscs(user.getOrganization()));
                }
            }

            return responseStatus(res, 403, MSG_403);
        });

        post("/rest/getDiscsOrg", (req, res) -> {
            res.type("application/json");
            User user = isUserLoggedIn(req);
            Organization org;
            try {
                org = g.fromJson(req.body(), Organization.class);
            } catch (Exception ex) {
                return responseStatus(res, 400, MSG_400);
            }

            if (user != null) {
                if (user.getRole() == User.Role.SUPER_ADMIN) {
                    return g.toJson(cloudService.getOrganizationDiscs(org.getName()));
                }
            }

            return responseStatus(res, 403, MSG_403);
        });

        post("/rest/getDiscsVm", (req, res) -> {
            res.type("application/json");
            User user = isUserLoggedIn(req);
            VM vm = null;
            try {
                vm = g.fromJson(req.body(), VM.class);
            } catch (Exception ex) {
                return responseStatus(res, 400, MSG_400);
            }

            if (user != null) {
                if (user.getRole() == User.Role.SUPER_ADMIN) {
                    return g.toJson(cloudService.getAllDiscs());
                } else {
                    return g.toJson(cloudService.getOrganizationDiscs(user.getOrganization()));
                }
            }

            return responseStatus(res, 403, MSG_403);
        });

        post("/rest/addDisc", (req, res) -> {
            res.type("application/json");
            User user = isUserLoggedIn(req);
            Disc disc;

            try {
                disc = g.fromJson(req.body(), Disc.class);
                disc.isValidData();
            } catch (Exception ex) {
                return responseStatus(res, 400, MSG_400);
            }

            if (user != null) {
                if (user.getRole() == User.Role.SUPER_ADMIN) {
                    return "{\"added\":" + cloudService.addDisc(disc) + "}";
                }
                else if (user.getRole() == User.Role.ADMIN) {
                    disc.setOrganizationName(user.getOrganization());
                    return "{\"added\":" + cloudService.addDisc(disc) + "}";
                }
            }

            return responseStatus(res, 403, MSG_403);
        });

        post("/rest/removeDisc", (req, res) -> {
            res.type("application/json");
            User user = isUserLoggedIn(req);
            Disc disc;
            try {
                disc = g.fromJson(req.body(), Disc.class);
            } catch (Exception ex) {
                return responseStatus(res, 400, MSG_400);
            }

            if (user != null) {
                if (user.getRole() == User.Role.SUPER_ADMIN) {
                    Disc d = cloudService.removeDisc(disc.getName());
                    return "{\"deleted\":" + (d != null) + "}";
                }
            }

            return responseStatus(res, 403, MSG_403);
        });

        post("/rest/getDisc", (req, res) -> {
            res.type("application/json");
            Session ss = req.session(true);
            Disc disc;
            try {
                disc = g.fromJson(req.body(), Disc.class);
                ss.attribute("discToChange", disc.getName());
            } catch (Exception ex) {
                return responseStatus(res, 400, MSG_400);
            }
            User user = isUserLoggedIn(req);

            if (user != null) {
                if (user.getRole() == User.Role.SUPER_ADMIN) {
                    return g.toJson(cloudService.getDisc(disc.getName()));
                }
                else {
                    Organization org = cloudService.getOrganization(user.getOrganization());
                    if(org.containsResource(disc.getName())) {
                        return g.toJson(cloudService.getDisc(disc.getName()));
                    }
                }
            }

            return responseStatus(res, 403, MSG_403);
        });

        post("/rest/editDisc", (req, res) -> {
            res.type("application/json");
            Disc disc;
            try {
                disc = g.fromJson(req.body(), Disc.class);
                disc.isValidData();
            } catch (Exception ex) {
                return responseStatus(res, 400, MSG_400);
            }
            User user = isUserLoggedIn(req);

            if (user != null) {
                String key = req.session(true).attribute("discToChange");
                if (user.getRole() == User.Role.SUPER_ADMIN) {
                    if (key != null) {
                        return "{\"added\":" + cloudService.changeDisc(key, disc) + "}";
                    }
                } else if (user.getRole() == User.Role.ADMIN) {
                    if (key != null) {
                        Organization org = cloudService.getOrganization(user.getOrganization());
                        disc.setOrganizationName(org.getName());
                        if(org.containsResource(disc.getName())) {
                            return "{\"added\":" + cloudService.changeDisc(key, disc) + "}";
                        }
                    }
                }
            }

            return responseStatus(res, 403, MSG_403);
        });
    }

    public static User isUserLoggedIn(Request req) {
        Session ss = req.session(true);
        return ss.attribute("user");
    }

    public static String responseStatus(Response res, int code, String message) {
        res.status(code);
        return "{\"message\": " + message + "}";
    }
}

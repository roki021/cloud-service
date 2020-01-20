package controler;

import beans.User;

import java.util.ArrayList;
import java.util.HashMap;

public class CloudServiceControler {
    private static User superAdmin = User.generateSuperAdmin("superadmin@gmail.com",
            "superadmin",
            "superadmin",
            "superadmin");

    private HashMap<String, User> users;

    public CloudServiceControler() {
        users = new HashMap<String, User>();
        users.put(superAdmin.getEmail(), superAdmin);
    }

    public boolean checkUserCredentials(User user) {
        if(user != null) {
            if(users.containsKey(user.getEmail())) {
                return users.get(user.getEmail()).equals(user);
            }
        }

        return false;
    }

    public User getUser(String key) {
        User user = null;

        if(users.containsKey(key))
            user = users.get(key);

        return user;
    }
}

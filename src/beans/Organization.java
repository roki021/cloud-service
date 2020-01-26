package beans;

import java.util.ArrayList;
import java.util.List;

public class Organization {
    private String name;
    private String description;
    private String logoUrl; // if logoUrl is null then default logo is set
    private List<String> users;
    private List<String> resources;

    public Organization() {
        users = new ArrayList<String>();
        resources = new ArrayList<String>();
    }

    public Organization(String name, String description, String logoUrl) {
        this.name = name;
        this.description = description;
        this.logoUrl = logoUrl;
        users = new ArrayList<String>();
        resources = new ArrayList<String>();
    }

    public Organization(String name, String description, String logoUrl, List<String> users, List<String> resources) {
        this.name = name;
        this.description = description;
        this.logoUrl = logoUrl;
        this.users = users;
        this.resources = resources;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getLogoUrl() {
        return logoUrl;
    }

    public void setLogoUrl(String logoUrl) {
        this.logoUrl = logoUrl;
    }

    public List<String> getUsers() {
        return List.copyOf(users);
    }

    public List<String> getResources() {
        return List.copyOf(resources);
    }

    public boolean containsUser(String userName) {
        return users.contains(userName);
    }

    public boolean addUser(String userName) {
        return users.add(userName);
    }

    public boolean removeUser(String userName) {
        return users.remove(userName);
    }

    public boolean containsResource(String resourceName) {
        return resources.contains(resourceName);
    }

    public boolean addResource(String resourceName) {
        return resources.add(resourceName);
    }

    public boolean removeResource(String resourceName) {
        return resources.remove(resourceName);
    }
}

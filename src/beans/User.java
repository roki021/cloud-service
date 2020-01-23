package beans;

public class User {
    public enum Role {SUPER_ADMIN, ADMIN, USER}

    private String email;
    private String password;
    private String firstName;
    private String lastName;
    private String organization;

    private Role role;

    public static User generateSuperAdmin(String email, String password, String firstName, String lastName) {
        return new User(email, password, firstName, lastName, null, Role.SUPER_ADMIN);
    }

    public User() {}

    public User(String email, String password, String firstName, String lastName, String organization, Role role) {
        this.email = email;
        this.password = password;
        this.firstName = firstName;
        this.lastName = lastName;
        this.organization = organization;
        this.role = role;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getOrganization() {
        return organization;
    }

    public void setOrganization(String organization) {
        this.organization = organization;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public boolean equals(Object obj) {

        if(obj instanceof User) {
            User user = (User)obj;

            return email.equals(user.email) && password.equals(user.password);
        }

        return false;
    }
}

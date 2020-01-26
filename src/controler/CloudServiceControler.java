package controler;

import beans.*;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import java.io.*;
import java.util.*;

public class CloudServiceControler {

    private static final String LOGO_PATH = "logos";
    private static final String DATA_PATH = "./data";
    private static final String ORG_FILE = "/organizations.json";
    private static final String USERS_FILE = "/users.json";


    private HashMap<String, User> users;
    private HashMap<String, Organization> organizations;
    private HashMap<String, VM> virtualMachines;
    private HashMap<String, VMCategory> vmCategories;
    private HashMap<String, Disc> discs;
    private HashMap<String, User> superAdmins;
    private Gson g;

    private static String generateRandomString() {
        int leftLimit = 48; // numeral '0'
        int rightLimit = 122; // letter 'z'
        int targetStringLength = 7;
        Random random = new Random();

        return random.ints(leftLimit, rightLimit + 1)
                .filter(i -> (i <= 57 || i >= 65) && (i <= 90 || i >= 97))
                .limit(targetStringLength)
                .collect(StringBuilder::new, StringBuilder::appendCodePoint, StringBuilder::append)
                .toString();
    }

    private void setUpSuperAdmins() {
        if(superAdmins != null) {
            User suAdmin1 =  User.generateSuperAdmin("superadmin@gmail.com",
                    "superadmin",
                    "superadmin",
                    "superadmin");
            User suAdmin2 =  User.generateSuperAdmin("clouder@gmail.com",
                    "clouder123",
                    "John",
                    "Jackson");
            superAdmins.put(suAdmin1.getEmail(), suAdmin1);
            superAdmins.put(suAdmin2.getEmail(), suAdmin2);
        }
    }

    private void loadFiles() {
        loadOrganizations(DATA_PATH + ORG_FILE);
        loadUsers(DATA_PATH + USERS_FILE);
    }

    private void saveFile(Collection<?> collection, String filePath) {
        try(FileWriter fw = new FileWriter(filePath)) {
            g.toJson(collection, fw);
        } catch (IOException ioe) {
            ioe.printStackTrace();
            System.out.println("Data not saved");
        }
    }

    public CloudServiceControler() {
        users = new HashMap<String, User>();
        organizations = new HashMap<String, Organization>();
        virtualMachines = new HashMap<String, VM>();
        vmCategories = new HashMap<String, VMCategory>();
        discs = new HashMap<String, Disc>();
        superAdmins = new HashMap<String, User>();

        g = new GsonBuilder().setPrettyPrinting().create();

        File dataFolder = new File(DATA_PATH);
        if(!dataFolder.exists())
            if (dataFolder.mkdir())
                System.out.println("Directory is created!");
            else
                System.out.println("Failed to create directory!");

        loadFiles();
        setUpSuperAdmins();
    }

    /* ********************* USER ********************* */

    private void loadUsers(String filePath) {
        if(new File(filePath).exists()) {
            try(FileReader fr = new FileReader(filePath)) {
                for(User user : g.fromJson(fr, User[].class)) {
                    users.put(user.getEmail(), user);
                }
            } catch (IOException ioe) {
                ioe.printStackTrace();
                System.out.println("Data not loaded");
            }
        }
    }

    public boolean checkUserCredentials(User user) {
        if(user != null) {
            if(users.containsKey(user.getEmail())) {
                return users.get(user.getEmail()).equals(user);
            }
            else if(superAdmins.containsKey(user.getEmail())) {
                return superAdmins.get(user.getEmail()).equals(user);
            }
        }

        return false;
    }

    public User getUser(String key) {
        User user = null;

        if(users.containsKey(key))
            user = users.get(key);
        else if(superAdmins.containsKey(key))
            user = superAdmins.get(key);

        return user;
    }

    public Collection<User> getAllUsers() {
        return users.values();
    }

    public List<User> getUsers(String organization) {
        ArrayList<User> found = new ArrayList<User>();
        for(User u : users.values()) {
            if(u.getOrganization() != null && u.getOrganization().equals(organization))
                found.add(u);
        }

        return found;
    }

    public boolean addUser(User user) {
        boolean retVal = false;
        if(user != null) {
            if(!users.containsKey(user.getEmail()) &&
                    !superAdmins.containsKey(user.getEmail())) {
                users.put(user.getEmail(), user);
                saveFile(users.values(), DATA_PATH + USERS_FILE);
                organizations.get(user.getOrganization()).addUser(user.getEmail());
                saveFile(organizations.values(), DATA_PATH + ORG_FILE);
                retVal = true;
            }
        }

        return retVal;
    }

    public User removeUser(String key) {
        User user = users.remove(key);
        saveFile(users.values(), DATA_PATH + USERS_FILE);
        organizations.get(user.getOrganization()).removeUser(user.getEmail());
        saveFile(organizations.values(), DATA_PATH + ORG_FILE);
        return user;
    }

    public boolean changeUser(String oldKey, User newUser) {
        boolean retVal = false;
        if(newUser != null) {
            if(!users.containsKey(newUser.getEmail()) &&
                    !superAdmins.containsKey(newUser.getEmail())) {
                removeUser(oldKey);
                users.put(newUser.getEmail(), newUser);
                saveFile(users.values(), DATA_PATH + USERS_FILE);
                retVal = true;
            }
        }

        return retVal;
    }

    public boolean changeUserCreditials(User newUser) {
        boolean retVal = false;
        if(newUser != null) {
            removeUser(newUser.getEmail());
            users.put(newUser.getEmail(), newUser);
            saveFile(users.values(), DATA_PATH + USERS_FILE);
            retVal = true;
        }

        return retVal;
    }

    public void changeUsersOrganization(String oldOrg, String newOrg) {
        for(User user : users.values()) {
            if(user.getOrganization() != null) {
                if(user.getOrganization().equals(oldOrg)) {
                    user.setOrganization(newOrg);
                }
            }
        }
    }

    /* ********************* ORGANIZATION ********************* */

    private void loadOrganizations(String filePath) {
        if(new File(filePath).exists()) {
            try(FileReader fr = new FileReader(filePath)) {
                for(Organization org : g.fromJson(fr, Organization[].class)) {
                    organizations.put(org.getName(), org);
                }
            } catch (IOException ioe) {
                ioe.printStackTrace();
                System.out.println("Data not loaded");
            }
        }
    }

    public Organization getOrganization(String key) {
        Organization org = null;

        if(organizations.containsKey(key))
            org = organizations.get(key);

        return org;
    }

    public Collection<Organization> getAllOrganizations() {
        return organizations.values();
    }

    public boolean addOrganization(Organization org) {
        boolean retVal = false;
        if(org != null) {
            if(!organizations.containsKey(org.getName())) {
                setUpLogo(org);
                organizations.put(org.getName(), org);
                saveFile(organizations.values(), DATA_PATH + ORG_FILE);
                retVal = true;
            }
        }

        return retVal;
    }

    public Organization removeOrganization(String key) {
        return organizations.remove(key);
    }

    public boolean changeOrganization(String oldKey, Organization newOrg) {
        boolean retVal = false;
        String path = "./static/";
        if(newOrg != null) {
            if(!organizations.containsKey(newOrg.getName()) || oldKey.equals(newOrg.getName())) {
                changeLogo(organizations.get(oldKey).getLogoUrl(), newOrg);
                removeOrganization(oldKey);
                organizations.put(newOrg.getName(), newOrg);
                changeUsersOrganization(oldKey, newOrg.getName());
                saveFile(organizations.values(), DATA_PATH + ORG_FILE);
                retVal = true;
            }
        }

        return retVal;
    }

    public String extractImageFromBytes(String logo, String imgPath) {
        if(logo == null) {
            return imgPath;
        }

        String newImgPath = "";
        if(imgPath.contains("users.png"))
            newImgPath = LOGO_PATH + "/" + generateRandomString() + ".jpg";
        else
            newImgPath = imgPath;

        try(OutputStream writer = new FileOutputStream("./static/" + newImgPath)) {
            StringReader reader = new StringReader(logo);
            int k = 0;
            while((k = reader.read()) != -1){
                writer.write(k);
            }
            System.out.println("Image extracted successfully");
        } catch (IOException ioe) {
            ioe.printStackTrace();
            System.out.println("Image extracted unsuccessfully");
        }

        return newImgPath;
    }

    public void setUpLogo(Organization org) {
        org.setLogoUrl(extractImageFromBytes(org.getLogoUrl(), LOGO_PATH + "/users.png"));
    }

    public void changeLogo(String oldLogo, Organization newOrg) {
        newOrg.setLogoUrl(extractImageFromBytes(newOrg.getLogoUrl(), oldLogo));
    }

    /* ********************* VM ********************* */

    public VM getVM(String key) {
        VM vm = null;

        if(virtualMachines.containsKey(key))
            vm = virtualMachines.get(key);

        return vm;
    }

    public Collection<VM> getAllVMs() {
        return virtualMachines.values();
    }

    public boolean addVM(VM vm) {
        boolean retVal = false;
        if(vm != null) {
            if(!virtualMachines.containsKey(vm.getName())) {
                virtualMachines.put(vm.getName(), vm);
                retVal = true;
            }
        }

        return retVal;
    }

    public VM removeVM(String key) {
        return virtualMachines.remove(key);
    }

    public boolean changeVM(String oldKey, VM newVM) {
        boolean retVal = false;
        if(newVM != null) {
            if(!virtualMachines.containsKey(newVM.getName()) || oldKey.equals(newVM.getName())) {
                removeVM(oldKey);
                virtualMachines.put(newVM.getName(), newVM);
                retVal = true;
            }
        }

        return retVal;
    }

    /* ********************* DISC ********************* */

    public Disc getDisc(String key) {
        Disc disc = null;

        if(discs.containsKey(key))
            disc = discs.get(key);

        return disc;
    }

    public Collection<Disc> getAllDiscs() {
        return discs.values();
    }

    public boolean addDisc(Disc disc) {
        boolean retVal = false;
        if(disc != null) {
            if(!discs.containsKey(disc.getName())) {
                discs.put(disc.getName(), disc);
                retVal = true;
            }
        }

        return retVal;
    }

    public Disc removeDisc(String key) {
        return discs.remove(key);
    }

    public boolean changeDisc(String oldKey, Disc newDisc) {
        boolean retVal = false;
        if(newDisc != null) {
            if(!discs.containsKey(newDisc.getName()) || oldKey.equals(newDisc.getName())) {
                removeDisc(oldKey);
                discs.put(newDisc.getName(), newDisc);
                retVal = true;
            }
        }

        return retVal;
    }

    /* ********************* VM_CATEGORY ********************* */

    public VMCategory getVMCategory(String key) {
        VMCategory vmCategory = null;

        if(vmCategories.containsKey(key))
            vmCategory = vmCategories.get(key);

        return vmCategory;
    }

    public Collection<VMCategory> getAllVMCategories() {
        return vmCategories.values();
    }

    public boolean addVMCategory(VMCategory vmCategory) {
        boolean retVal = false;
        if(vmCategory != null) {
            if(!vmCategories.containsKey(vmCategory.getName())) {
                vmCategories.put(vmCategory.getName(), vmCategory);
                retVal = true;
            }
        }

        return retVal;
    }

    public VMCategory removeVMCategory(String key) {
        return vmCategories.remove(key);
    }

    public boolean changeVMCategory(String oldKey, VMCategory newVMCategory) {
        boolean retVal = false;
        if(newVMCategory != null) {
            if(!vmCategories.containsKey(newVMCategory.getName())
                    || oldKey.equals(newVMCategory.getName())) {
                removeVMCategory(oldKey);
                vmCategories.put(newVMCategory.getName(), newVMCategory);
                retVal = true;
            }
        }

        return retVal;
    }
}

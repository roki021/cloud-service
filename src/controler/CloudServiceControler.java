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
    private static final String CATS_FILE = "/vmcategories.json";
    private static final String DISC_FILE = "/discs.json";
    private static final String VM_FILE = "/vm.json";

    private static final double CORE_PRICE = 25.0 / (30.0 * 24.0);
    private static final double RAM_PRICE = 15.0 / (30.0 * 24.0);
    private static final double GPU_CORE_PRICE = 1.0 / (30.0 * 24.0);
    private static final double HDD_PRICE_GB = 0.1 / (30.0 * 24.0);
    private static final double SSD_PRICE_GB = 0.3 / (30.0 * 24.0);


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
        loadVMCats(DATA_PATH + CATS_FILE);
        loadDiscs(DATA_PATH + DISC_FILE);
        loadVMs(DATA_PATH + VM_FILE);
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

    public boolean hasUserEmail(String email) {
        return users.containsKey(email) || superAdmins.containsKey(email);
    }

    public boolean changeProfile(User user, User newData) {
        boolean isChanged = false;
        String oldKey = user.getEmail();
        if(!hasUserEmail(newData.getEmail()) ||
            oldKey.equals(newData.getEmail())) {
            user.changeData(newData);
            if(user.getRole() == User.Role.SUPER_ADMIN) {
                superAdmins.remove(oldKey);
                superAdmins.put(user.getEmail(), user);
            }
            else {
                users.remove(oldKey);
                users.put(user.getEmail(), user);
                saveFile(users.values(), DATA_PATH + USERS_FILE);
            }
            isChanged = true;
        }

        return isChanged;
    }

    public int changePassword(User user, PasswordChange newPassword) {
        int returnCode = newPassword.isChangeValid(user.getPassword());

        if(returnCode == 0) {
            user.setPassword(newPassword.getNewPassword());
            if(user.getRole() != User.Role.SUPER_ADMIN) {
                saveFile(users.values(), DATA_PATH + USERS_FILE);
            }
        }

        return returnCode;
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

    public Organization getOrgThatContainsVM(String vmName) {
        for(Organization org : organizations.values()) {
            if(org.containsResource(vmName)) {
                return org;
            }
        }

        return null;
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

    public boolean addOrganizationResource(String org, String res) {
        boolean retVal = false;
        if(res != null) {
            if(org != null) {
                if (!organizations.get(org).containsResource(res)) {
                    organizations.get(org).addResource(res);
                    saveFile(organizations.values(), DATA_PATH + ORG_FILE);
                    retVal = true;
                }
            }
        }
        return retVal;
    }

    public void changeOrgIdInResources(Organization org) {
        for(String resource : org.getResources()) {
            if(virtualMachines.containsKey(resource)) {
                virtualMachines.get(resource).setOrganizationName(org.getName());
            } else if(discs.containsKey(resource)) {
                discs.get(resource).setOrganizationName(org.getName());
            }
        }
    }

    public boolean removeOrganizationResource(String org, String res) {
        boolean retVal = false;
        if(res != null) {
            if(org != null) {
                if (organizations.get(org).containsResource(res)) {
                    organizations.get(org).removeResource(res);
                    saveFile(organizations.values(), DATA_PATH + ORG_FILE);
                    retVal = true;
                }
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
                newOrg.takeDataFromLists(organizations.get(oldKey));
                changeOrgIdInResources(newOrg);
                removeOrganization(oldKey);
                organizations.put(newOrg.getName(), newOrg);
                changeUsersOrganization(oldKey, newOrg.getName());
                saveAfterDiscChange();
                saveFile(users.values(), DATA_PATH + USERS_FILE);
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

    private void loadVMs(String filePath) {
        if(new File(filePath).exists()) {
            try(FileReader fr = new FileReader(filePath)) {
                for(VM vm : g.fromJson(fr, VM[].class)) {
                    virtualMachines.put(vm.getName(), vm);
                }
            } catch (IOException ioe) {
                ioe.printStackTrace();
                System.out.println("Data not loaded");
            }
        }
    }

    private double calculateVMBill(VM vm, PeriodBill period) {
        double price = 0.0;
        Date intervalStart;
        Date intervalEnd;
        for(Activity act : vm.getActivities()) {
            if(act.getStarted().after(period.getFromDate())) {
                intervalStart = act.getStarted();
            }
            else {
                intervalStart = period.getFromDate();
            }

            if(!act.isStopped()) {
                intervalEnd = period.getToDate();
            }
            else {
                if(act.getStopped().before(period.getToDate())) {
                    intervalEnd = act.getStopped();
                }
                else {
                    intervalEnd = period.getToDate();
                }
            }

            long diff = intervalEnd.getTime() - intervalStart.getTime();
            double diffHours = diff / (60.0 * 60.0 * 1000.0);

            int coreNum = vmCategories.get(vm.getCategoryName()).getCores();
            int ramNum = vmCategories.get(vm.getCategoryName()).getRam();
            int gpuCoreNum = vmCategories.get(vm.getCategoryName()).getGpuCores();

            price += diffHours * (CORE_PRICE * coreNum +
                    RAM_PRICE * ramNum + GPU_CORE_PRICE * gpuCoreNum);
        }

        return price;
    }

    private double calculateDiscBill(Disc disc, PeriodBill period) {
        long diff = period.getToDate().getTime() - period.getFromDate().getTime();
        double diffHours = diff / (60.0 * 60.0 * 1000.0);

        if(disc.getDiscType() == Disc.DiscType.SSD) {
            return diffHours * SSD_PRICE_GB * disc.getCapacity();
        }
        else {
            return diffHours * HDD_PRICE_GB * disc.getCapacity();
        }
    }

    public VM getVM(String key) {
        VM vm = null;

        if(virtualMachines.containsKey(key))
            vm = virtualMachines.get(key);

        return vm;
    }

    public Collection<VM> getAllVMs() {
        return virtualMachines.values();
    }

    public Collection<VM> getVMs(String organization) {
        ArrayList<VM> vms = new ArrayList<VM>();
        Organization org = organizations.get(organization);
        if(org != null) {
            for(VM vm : virtualMachines.values()) {
                if(org.containsResource(vm.getName()))
                    vms.add(vm);
            }
        }
        return vms;
    }

    public boolean addVM(VM vm) {
        boolean retVal = false;
        if(vm != null) {
            if(!virtualMachines.containsKey(vm.getName())) {
                virtualMachines.put(vm.getName(), vm);
                saveFile(virtualMachines.values(), DATA_PATH + VM_FILE);
                retVal = true;
            }
        }

        return retVal;
    }

    public VM removeVM(String key) {
        VM vm = virtualMachines.remove(key);
        saveFile(virtualMachines.values(), DATA_PATH + VM_FILE);
        return vm;
    }

    public int changeVM(String oldKey, VM newVM) {
        int retVal = 1;
        if(newVM != null) {
            if(!virtualMachines.containsKey(newVM.getName()) || oldKey.equals(newVM.getName())) {
                if(newVM.checkOverlapActivities())
                    return 2;
                ArrayList<String> oldAttachedDiscs = new ArrayList<String>();
                oldAttachedDiscs = (ArrayList<String>) getVM(oldKey).getAttachedDiscs();
                removeVM(oldKey);
                virtualMachines.put(newVM.getName(), newVM);
                if(!newVM.getName().equals(oldKey)) {
                    for (Disc d : discs.values()) {
                        if (d.getVirtualMachine() != null)
                            if (d.getVirtualMachine().equals(oldKey))
                                d.setVirtualMachine(newVM.getName());
                    }
                    for (Organization o : organizations.values()) {
                        if (o.containsResource(oldKey)) {
                            o.removeResource(oldKey);
                            o.addResource(newVM.getName());
                        }
                    }
                }
                for (Disc d : discs.values()) {
                    if(oldAttachedDiscs.contains(d.getName()))
                        d.setVirtualMachine(null);
                    if(newVM.getAttachedDiscs().contains(d.getName()))
                        d.setVirtualMachine(newVM.getName());
                }

                saveFile(virtualMachines.values(), DATA_PATH + VM_FILE);
                saveFile(discs.values(), DATA_PATH + DISC_FILE);
                saveFile(organizations.values(), DATA_PATH + ORG_FILE);

                retVal = 0;
            }
        }

        return retVal;
    }

    public boolean toggleState(String key) {
        boolean success = virtualMachines.get(key).toggleState();
        saveFile(virtualMachines.values(), DATA_PATH + VM_FILE);
        return success;
    }

    public Collection<PeriodBill> getBill(User u, PeriodBill period) {
        ArrayList<PeriodBill> billing = new ArrayList<PeriodBill>();

        if(period.checkDateInterval()) {
            for (String resource : organizations.get(u.getOrganization()).getResources()) {
                PeriodBill bill = new PeriodBill(period);
                if (virtualMachines.containsKey(resource)) {
                    VM vm = virtualMachines.get(resource);
                    bill.setPrice(calculateVMBill(vm, period));
                    bill.setResourceName(resource);
                }

                if (discs.containsKey(resource)) {
                    Disc disc = discs.get(resource);
                    bill.setPrice(calculateDiscBill(disc, period));
                    bill.setResourceName(resource);
                }
                billing.add(bill);
            }
        }
        else {
            billing.add(null);
        }

        return billing;
    }



    /* ********************* DISC ********************* */

    private void loadDiscs(String filePath) {
        if(new File(filePath).exists()) {
            try(FileReader fr = new FileReader(filePath)) {
                for(Disc disc : g.fromJson(fr, Disc[].class)) {
                    discs.put(disc.getName(), disc);
                }
            } catch (IOException ioe) {
                ioe.printStackTrace();
                System.out.println("Data not loaded");
            }
        }
    }

    private void saveAfterDiscChange() {
        saveFile(discs.values(), DATA_PATH + DISC_FILE);
        saveFile(organizations.values(), DATA_PATH + ORG_FILE);
        saveFile(virtualMachines.values(), DATA_PATH + VM_FILE);
    }

    public Disc getDisc(String key) {
        Disc disc = null;

        if(discs.containsKey(key))
            disc = discs.get(key);

        return disc;
    }

    public Collection<Disc> getAllDiscs() {
        return discs.values();
    }

    public Collection<Disc> getOrganizationDiscs(String orgKey) {
        Organization org = organizations.get(orgKey);
        ArrayList<Disc> orgDiscs = new ArrayList<Disc>();

        for(String discName : org.getResources()) {
            if(discs.containsKey(discName))
                orgDiscs.add(discs.get(discName));
        }

        return orgDiscs;
    }

    public void addDiscToVM(Disc disc) {
        if(disc.getVirtualMachine() != null) {
            VM vm = virtualMachines.get(disc.getVirtualMachine());
            if(vm != null) {
                if(vm.getOrganizationName().equals(disc.getOrganizationName())) {
                    Organization org = organizations.get(vm.getOrganizationName());
                    vm.addAttachedDisc(disc.getName());
                }
            }
        }
    }

    public boolean addDisc(Disc disc) {
        boolean retVal = false;
        if(disc != null) {
            if(!discs.containsKey(disc.getName()) &&
                    !virtualMachines.containsKey(disc.getName())) {
                if(disc.getVirtualMachine().isEmpty()) {
                    disc.setVirtualMachine(null);
                }
                discs.put(disc.getName(), disc);
                organizations.get(disc.getOrganizationName()).addResource(disc.getName());
                addDiscToVM(disc);
                saveAfterDiscChange();
                retVal = true;
            }
        }

        return retVal;
    }

    public Disc removeDisc(String key) {
        Disc disc = discs.get(key);
        VM vm = virtualMachines.get(disc.getVirtualMachine());
        if(vm != null) {
            vm.removeAttachedDisc(key);
        }

        disc = discs.remove(key);
        if(disc != null) {
            organizations.get(disc.getOrganizationName()).removeResource(key);
        }
        saveAfterDiscChange();
        return disc;
    }

    public boolean changeDisc(String oldKey, Disc newDisc) {
        boolean retVal = false;
        if(newDisc != null) {
            if((!discs.containsKey(newDisc.getName()) &&
                    !virtualMachines.containsKey(newDisc.getName()))
                    || oldKey.equals(newDisc.getName())) {
                if(newDisc.getVirtualMachine().isEmpty()) {
                    newDisc.setVirtualMachine(null);
                }
                removeDisc(oldKey);
                discs.put(newDisc.getName(), newDisc);
                organizations.get(newDisc.getOrganizationName()).addResource(newDisc.getName());
                addDiscToVM(newDisc);
                saveAfterDiscChange();
                retVal = true;
            }
        }

        return retVal;
    }

    public void setUsingDiscs(List<String> usingDiscs, String vmName) {
        if(discs != null) {
            for(Disc disc : discs.values()) {
                if(usingDiscs.contains(disc.getName()))
                    disc.setVirtualMachine(vmName);
            }
            saveFile(discs.values(), DATA_PATH + DISC_FILE);
        }
    }

    public void setUsingDisc(String disc, String vmName) {
        if(discs != null) {
            discs.get(disc).setVirtualMachine(vmName);
            saveFile(discs.values(), DATA_PATH + DISC_FILE);
        }
    }

    public void setNotUsingDiscs(List<String> usingDiscs) {
        if(discs != null) {
            for(Disc disc : discs.values()) {
                if(usingDiscs.contains(disc.getName()))
                    disc.setVirtualMachine(null);
            }
            saveFile(discs.values(), DATA_PATH + DISC_FILE);
        }
    }

    /* ********************* VM_CATEGORY ********************* */

    private void loadVMCats(String filePath) {
        if(new File(filePath).exists()) {
            try(FileReader fr = new FileReader(filePath)) {
                for(VMCategory cat : g.fromJson(fr, VMCategory[].class)) {
                    vmCategories.put(cat.getName(), cat);
                }
            } catch (IOException ioe) {
                ioe.printStackTrace();
                System.out.println("Data not loaded");
            }
        }
    }

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
                saveFile(vmCategories.values(), DATA_PATH + CATS_FILE);
                retVal = true;
            }
        }

        return retVal;
    }

    public VMCategory removeVMCategory(String key) {
        for(VM vm : virtualMachines.values()) {
            if(vm.getCategoryName().equals(key)) {
                return null;
            }
        }
        VMCategory cat = vmCategories.remove(key);
        saveFile(vmCategories.values(), DATA_PATH + CATS_FILE);
        return cat;
    }

    public boolean changeVMCategory(String oldKey, VMCategory newVMCategory) {
        boolean retVal = false;
        if(newVMCategory != null) {
            if(!vmCategories.containsKey(newVMCategory.getName())
                    || oldKey.equals(newVMCategory.getName())) {
                for(VM vm : virtualMachines.values()) {
                    if(vm.getCategoryName().equals(oldKey))
                        vm.setCategoryName(newVMCategory.getName());
                }
                removeVMCategory(oldKey);
                vmCategories.put(newVMCategory.getName(), newVMCategory);
                saveFile(virtualMachines.values(), DATA_PATH + VM_FILE);
                saveFile(vmCategories.values(), DATA_PATH + CATS_FILE);
                retVal = true;
            }
        }

        return retVal;
    }
}

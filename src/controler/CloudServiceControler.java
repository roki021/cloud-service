package controler;

import beans.*;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;

public class CloudServiceControler {

    private HashMap<String, User> users;
    private HashMap<String, Organization> organizations;
    private HashMap<String, VM> virtualMachines;
    private HashMap<String, VMCategory> vmCategories;
    private HashMap<String, Disc> discs;
    private HashMap<String, User> superAdmins;

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

    public CloudServiceControler() {
        users = new HashMap<String, User>();
        organizations = new HashMap<String, Organization>();
        virtualMachines = new HashMap<String, VM>();
        vmCategories = new HashMap<String, VMCategory>();
        discs = new HashMap<String, Disc>();
        superAdmins = new HashMap<String, User>();

        setUpSuperAdmins();
    }

    /* ********************* USER ********************* */

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
            if(u.getOrganization().equals(organization))
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
                retVal = true;
            }
        }

        return retVal;
    }

    public User removeUser(String key) {
        return users.remove(key);
    }

    public boolean changeUser(String oldKey, User newUser) {
        boolean retVal = false;
        if(newUser != null) {
            if(!users.containsKey(newUser.getEmail()) &&
                    !superAdmins.containsKey(newUser.getEmail())) {
                removeUser(oldKey);
                users.put(newUser.getEmail(), newUser);
                retVal = true;
            }
        }

        return retVal;
    }

    /* ********************* ORGANIZATION ********************* */

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
                organizations.put(org.getName(), org);
                retVal = true;
            }
        }

        return retVal;
    }

    public Organization removeOrganization(String key) {
        return organizations.remove(key);
    }

    public boolean changeOrganizations(String oldKey, Organization newOrg) {
        boolean retVal = false;
        if(newOrg != null) {
            if(!organizations.containsKey(newOrg.getName())) {
                removeOrganization(oldKey);
                organizations.put(newOrg.getName(), newOrg);
                retVal = true;
            }
        }

        return retVal;
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
            if(!virtualMachines.containsKey(newVM.getName())) {
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
            if(!discs.containsKey(newDisc.getName())) {
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
            if(!vmCategories.containsKey(newVMCategory.getName())) {
                removeVMCategory(oldKey);
                vmCategories.put(newVMCategory.getName(), newVMCategory);
                retVal = true;
            }
        }

        return retVal;
    }
}

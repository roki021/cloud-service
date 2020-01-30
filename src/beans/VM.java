package beans;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

public  class VM extends Resource{
    private String categoryName;
    private String organizationName;
    private List<String> attachedDiscs;
    private List<Activity> activities;

    public VM() {
        this.attachedDiscs = new ArrayList<String>();
        this.activities = new ArrayList<Activity>();
    }

    public VM(String name, String categoryName, String organizationName, List<String> attachedDiscs, List<Activity> activities) {
        super(name);
        this.categoryName = categoryName;
        this.organizationName = organizationName;
        this.attachedDiscs = attachedDiscs;
        this.activities = activities;
    }

    public VM(String name, String categoryName, String organizationName) {
        super(name);
        this.categoryName = categoryName;
        this.organizationName = organizationName;
        this.attachedDiscs = new ArrayList<String>();
        this.activities = new ArrayList<Activity>();
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public List<String> getAttachedDiscs() {
        return attachedDiscs;
    }

    public void addAttachedDisc(String disc) {
        this.attachedDiscs.add(disc);
    }

    public void removeAttachedDisc(String disc) {
        this.attachedDiscs.remove(disc);
    }

    public List<Activity> getActivities() {
        return activities;
    }

    public void addActivity(Activity activity) {
        this.activities.add(activity);
    }

    public String getOrganizationName() {
        return organizationName;
    }

    public void setOrganizationName(String organizationName) {
        this.organizationName = organizationName;
    }

    public boolean toggleState() {
        if(activities.isEmpty()) {
            activities.add(new Activity(new Date(), null));
            return true;
        }
        else {
            Activity last = activities.get(activities.size() - 1);
            if(last.isStopped()) {
                activities.add(new Activity(new Date(), null));
                return true;
            }
            else {
                last.setStopped(new Date());
                return false;
            }
        }
    }

    @Override
    public String toString() {
        return "VM{" +
                "categoryName='" + categoryName + '\'' +
                ", organizationName='" + organizationName + '\'' +
                ", attachedDiscs=" + attachedDiscs +
                ", activities=" + activities +
                '}';
    }
}

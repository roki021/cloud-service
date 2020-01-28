package beans;

import java.util.ArrayList;
import java.util.List;

public  class VM extends Resource{
    private String categoryName;
    private List<String> attachedDiscs;
    private List<Activity> activities;

    public VM() {
        this.attachedDiscs = new ArrayList<String>();
        this.activities = new ArrayList<Activity>();
    }

    public VM(String name, String categoryName, List<String> attachedDiscs, List<Activity> activities) {
        super(name);
        this.categoryName = categoryName;
        this.attachedDiscs = attachedDiscs;
        this.activities = activities;
    }

    public VM(String name, String categoryName) {
        super(name);
        this.categoryName = categoryName;
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

    @Override
    public String toString() {
        return "VM{" +
                "categoryName='" + categoryName + '\'' +
                ", attachedDiscs=" + attachedDiscs +
                ", activities=" + activities +
                '}';
    }
}

package beans;

public class Disc extends Resource{
    public enum DiscType { SSD, HDD };

    private DiscType discType;
    private int capacity; // capacity is shown in GB
    private String virtualMachine;

    public Disc() {
    }

    public Disc(String name, DiscType discType, int capacity, String virtualMachine) {
        super(name);
        this.discType = discType;
        this.capacity = capacity;
        this.virtualMachine = virtualMachine;
    }

    public DiscType getDiscType() {
        return discType;
    }

    public void setDiscType(DiscType discType) {
        this.discType = discType;
    }

    public int getCapacity() {
        return capacity;
    }

    public void setCapacity(int capacity) {
        this.capacity = capacity;
    }

    public String getVirtualMachine() {
        return virtualMachine;
    }

    public void setVirtualMachine(String virtualMachine) {
        this.virtualMachine = virtualMachine;
    }
}

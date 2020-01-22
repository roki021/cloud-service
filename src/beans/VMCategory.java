package beans;

public class VMCategory {
    private String name;
    private int cores;
    private int ram;
    private int gpuCores;

    public VMCategory() {
    }

    public VMCategory(String name, int cores, int ram, int gpuCores) {
        this.name = name;
        this.cores = cores;
        this.ram = ram;
        this.gpuCores = gpuCores;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getCores() {
        return cores;
    }

    public void setCores(int cores) {
        this.cores = cores;
    }

    public int getRam() {
        return ram;
    }

    public void setRam(int ram) {
        this.ram = ram;
    }

    public int getGpuCores() {
        return gpuCores;
    }

    public void setGpuCores(int gpuCores) {
        this.gpuCores = gpuCores;
    }
}

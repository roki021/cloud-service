package beans;

import java.util.Date;

public class PeriodBill {
    private Date fromDate;
    private Date toDate;
    private double price;
    private String resourceName;

    public PeriodBill() {}

    public PeriodBill(Date fromDate, Date toDate, double price, String resourceName) {
        this.fromDate = fromDate;
        this.toDate = toDate;
        this.price = price;
        this.resourceName = resourceName;
    }

    public PeriodBill(PeriodBill p) {
        this.fromDate = p.fromDate;
        this.toDate = p.toDate;
        this.price = p.price;
        this.resourceName = p.resourceName;
    }

    public Date getFromDate() {
        return fromDate;
    }

    public void setFromDate(Date fromDate) {
        this.fromDate = fromDate;
    }

    public Date getToDate() {
        return toDate;
    }

    public void setToDate(Date toDate) {
        this.toDate = toDate;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public String getResourceName() {
        return resourceName;
    }

    public void setResourceName(String resourceName) {
        this.resourceName = resourceName;
    }

    public boolean checkDateInterval() {
        return toDate.getTime() - fromDate.getTime() >= 0;
    }
}

package beans;

import java.util.Date;

public class Activity {
    private Date started;
    private Date stopped;

    public Activity() {
    }

    public Activity(Date started, Date stopped) {
        this.started = started;
        this.stopped = stopped;
    }

    public Date getStarted() {
        return started;
    }

    public void setStarted(Date started) {
        this.started = started;
    }

    public Date getStopped() {
        return stopped;
    }

    public void setStopped(Date stopped) {
        this.stopped = stopped;
    }
}

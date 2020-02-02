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

    public boolean isStopped() {
        return stopped != null;
    }

    public boolean isOverlapping(Activity a) {
        boolean retVal = true;
        Activity act1 = new Activity(started, stopped);
        Activity act2 = new Activity(a.started, a.stopped);
        if(act1.stopped == null)
            act1.stopped = new Date();
        if(act2.stopped == null)
            act2.stopped = new Date();

        if(!act1.started.after(act2.started)) {
            if(!act1.stopped.after(act2.started)) {
                retVal = false;
            }
        } else if(!act1.started.before(act2.stopped)) {
            retVal = false;
        }

        return retVal;
    }
}

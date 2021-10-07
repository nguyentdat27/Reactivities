import { makeAutoObservable, runInAction } from "mobx";
import agent from "../api/agent";
import { Activity } from "../models/activity";
import { v4 as uuid } from "uuid";

export default class ActivityStore {
  activityRegistry = new Map<string, Activity>();
  selectedActivity: Activity | undefined = undefined;
  editMode = false;
  loading = false;
  loadingInitial = true;

  constructor() {
    makeAutoObservable(this);
  }
  get activitiesByDate() {
    return Array.from(this.activityRegistry.values()).sort((a, b) => {
      return Date.parse(a.date) - Date.parse(b.date);
    });
  }

  get groupedActivities() {
    return Object.entries(
      this.activitiesByDate.reduce((activities, activity) => {
        const date = activity.date;
        if (activities[date]) {
          activities[date] = [...activities[date], activity];
        } else {
          activities[date] = [activity];
        }
        return activities;
      }, {} as { [key: string]: Activity[] })
    );
  }
  loadingActivities = async () => {
    this.setLoadingInitial(true);
    try {
      const activities = await agent.Activities.list();
      runInAction(() => {
        activities.forEach((activity) => {
          this.setActivity(activity);
        });
        this.setLoadingInitial(false);
      });
    } catch (err) {
      console.log(err);
      runInAction(() => {
        this.setLoadingInitial(false);
      });
    }
  };
  loadActivity = async (id: string) => {
    if (id) {
      let activity = this.getActivity(id);
      if (activity) {
        this.selectedActivity = activity;
      } else {
        this.setLoadingInitial(true);
        try {
          const activity = await agent.Activities.details(id);
          this.selectedActivity = activity;
          this.setActivity(activity);
          this.setLoadingInitial(false);
        } catch (error) {
          console.log(error);
          this.setLoadingInitial(false);
        }
      }
    } else {
      this.selectedActivity = undefined;
    }
  };
  private getActivity = (id: string) => {
    return this.activityRegistry.get(id);
  };
  private setActivity = (activity: Activity) => {
    activity.date = activity.date.split("T")[0];
    this.activityRegistry.set(activity.id, activity);
  };

  setLoadingInitial = (state: boolean) => {
    this.loadingInitial = state;
  };

  createActivity = async (activity: Activity) => {
    this.loading = true;
    activity.id = uuid();
    try {
      await agent.Activities.create(activity);
      runInAction(() => {
        this.activityRegistry.set(activity.id, activity);
        this.selectedActivity = activity;
        this.editMode = false;
        this.loading = false;
      });
    } catch (error) {
      console.log(error);
      runInAction(() => {
        this.loading = false;
      });
    }
  };
  updateActivity = async (activity: Activity) => {
    this.loading = true;
    try {
      await agent.Activities.update(activity);
      runInAction(() => {
        this.activityRegistry.delete(activity.id);
        this.activityRegistry.set(activity.id, activity);
        this.selectedActivity = activity;
        this.editMode = false;
        this.loading = false;
      });
    } catch (err) {
      console.error(err);
      runInAction(() => {
        this.loading = false;
      });
    }
  };
  deleteActivity = async (id: string) => {
    this.loading = true;
    try {
      await agent.Activities.delete(id);
      runInAction(() => {
        this.activityRegistry.delete(id);
        this.loading = false;
      });
    } catch (error) {
      console.error(error);
      runInAction(() => {
        this.loading = false;
      });
    }
  };
}

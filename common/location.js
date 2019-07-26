import { display } from "display";
import { geolocation } from "geolocation";

import { distanceAlongRoute } from './routeMath';

class Location {
  locationWatchId = null; // GPS watcher ID
  lastKnownPosition = null;
  positionError = false;

  watchLocationStart() {
    this.locationWatchId = geolocation.watchPosition((position) => {
      this.lastKnownPosition = position;
      this.positionError = false;
      // console.log(JSON.stringify(position));
    }, (error) => {
      console.error(error);
      this.positionError = true;
    }, {
      enableHighAccuracy: true,
    });
  }

  watchLocationStop() {
    geolocation.clearWatch(this.locationWatchId);
    this.locationWatchId = null;
  }

  getDistanceRun() {
    if (this.lastKnownPosition) {
      const baseDistance = distanceAlongRoute(this.lastKnownPosition.coords);
      const positionAge = ((new Date().getTime()) - this.lastKnownPosition.timestamp) / 1000;
      const estimatedDelta = this.lastKnownPosition.coords.speed * positionAge;
      return baseDistance + estimatedDelta;
    }
    return null;
  }
}

const location = new Location();

export default location;

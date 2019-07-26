import clock from 'clock';
import document from 'document';
import { display } from 'display';

import { View, $at } from './view';
import Location from '../common/location';
import { routeDistance } from '../common/route';
import { getStartTime } from '../common/sharedState';
import { formatDuration } from '../common/time';

const hbhStartDist = 6156;
const hbhEndDist = 7715;

const $ = $at('#screen-run');

class RunView extends View {
  el = $();

  runDistanceLabel = $('#run-distance');
  runTimeLabel = $('#run-time');
  progressBar = $('#progress-bar');
  distance = null;
  progressBarContainerWidth = 0;
  progressBarWidth = 0;

  onMount() {
    this.progressBarContainerWidth = $('#progress-bar-container').getBBox().width;
    
    this.update({ evt: new Date() });
    
    clock.granularity = 'seconds';
    clock.ontick = this.update.bind(this);
  }

  onUnmount() {
  }

  update = (evt) => {
    this.distance = Location.getDistanceRun();
    this.time = evt.date;
    
    this.render();
  };

  getRunTime() {
    const startTime = Math.floor(getStartTime().getTime() / 1000);
    const now = Math.floor(new Date().getTime() / 1000);
    return now - startTime;
  }

  onRender() {
    this.runDistanceLabel.text = this.distance === null ? '' : `${(this.distance / 1000).toFixed(2)}km`;
    this.runTimeLabel.text = formatDuration(this.getRunTime());
    
    const progressBarWidth = Math.floor(this.progressBarContainerWidth * this.distance / routeDistance);
    this.progressBar.x = progressBarWidth;
    this.progressBar.width = this.progressBarContainerWidth - progressBarWidth;
    this.progressBar.display = 'none';
  }
}

export default RunView;
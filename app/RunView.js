import clock from 'clock';
import document from 'document';
import exercise from 'exercise';
import { display } from 'display';

import { View, $at } from './view';
import Location from '../common/location';
import { routeDistance } from '../common/route';
import { getStartTime } from '../common/sharedState';
import { formatDuration } from '../common/time';

const hbhStartDist = 6156;
const hbhEndDist = 7715;

const $ = $at('#screen-run');

const AVERAGE = 0;
const CURRENT = 1;

class RunView extends View {
  el = $();

  runPaceLabel = $('#run-pace-label');
  runDistanceDisplay = $('#run-distance');
  runTimeDisplay = $('#run-time');
  progressBar = $('#progress-bar');
  runPaceDisplay = $('#run-pace');
  runProjectedTimeDisplay = $('#run-projected-time');
  distance = null;
  progressBarContainerWidth = 0;
  progressBarWidth = 0;
  paceMode = AVERAGE;

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

  getAveragePace() {
    if (this.distance === 0) return 0;
    return this.getRunTime() / (this.distance / 1000);
  }

  getPace() {
    if (this.paceMode === CURRENT) {
      return exercise.stats.pace.current;
    } else {
      return this.getAveragePace();
    }
  }

  getPredictedFinishTime() {
    return this.getPace() * routeDistance / 1000;
  }

  onRender() {
    this.runDistanceDisplay.text = this.distance === null ? '' : `${(this.distance / 1000).toFixed(2)}km`;
    this.runTimeDisplay.text = formatDuration(this.getRunTime());
    
    const progressBarWidth = Math.floor(this.progressBarContainerWidth * this.distance / routeDistance);
    this.progressBar.x = progressBarWidth;
    this.progressBar.width = this.progressBarContainerWidth - progressBarWidth;
    this.progressBar.display = 'none';

    this.runPaceLabel.text = this.paceMode === CURRENT ? 'Pace (current)' : 'Pace (avg)';
    this.runPaceDisplay.text = this.distance === 0 ? '' : `${formatDuration(Math.round(this.getPace()))} min/km`;

    this.runProjectedTimeDisplay.text = this.distance === 0 ? '' : formatDuration(Math.round(this.getPredictedFinishTime()));
  }
}

export default RunView;
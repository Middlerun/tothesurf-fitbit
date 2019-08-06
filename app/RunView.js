import clock from 'clock';
import document from 'document';
import exercise from 'exercise';
import { display } from 'display';

import { Application, View, $at } from './view';
import Location from '../common/location';
import { routeDistance } from '../common/route';
import { get, set } from '../common/sharedState';
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
  paceModeToggle = $('#pace-mode-toggle');
  finishButton = $('#finish-btn');
  cancelModal = $('#cancel-modal');
  noCancelButton = $('#no-cancel');
  yesCancelButton = $('#yes-cancel');
  finishModal = $('#finish-modal');
  noFinishButton = $('#no-finish');
  yesFinishButton = $('#yes-finish');
  distance = null;
  progressBarContainerWidth = 0;
  progressBarWidth = 0;
  paceMode = AVERAGE;
  cancelModalVisible = false;
  finishModalVisible = false;

  onMount() {
    this.progressBarContainerWidth = $('#progress-bar-container').getBBox().width;
    
    clock.granularity = 'seconds';
    clock.ontick = this.update.bind(this);

    this.paceModeToggle.onclick = this.togglePaceMode;

    this.noCancelButton.onclick = this.hideCancelModal;
    this.yesCancelButton.onclick = this.cancel;

    this.finishButton.onclick = this.showFinishModal;
    this.noFinishButton.onclick = this.hideFinishModal;
    this.yesFinishButton.onclick = this.finish;

    document.onkeypress = this.onKeyPress;
    
    this.update({ evt: new Date() });
  }

  onUnmount() {
    clock.granularity = 'off';
    clock.ontick = null;
    document.onkeypress = null;
  }

  onKeyPress = (e) => {
    if (e.key === 'back') {
      e.preventDefault();
      this.showCancelModal();
    }
  }

  showCancelModal = () => {
    this.cancelModalVisible = true;
    this.render();
  };

  hideCancelModal = () => {
    this.cancelModalVisible = false;
    this.render();
  };

  showFinishModal = () => {
    this.finishModalVisible = true;
    this.render();
  };

  hideFinishModal = () => {
    this.finishModalVisible = false;
    this.render();
  };

  cancel = () => {
    exercise.stop();
    Application.switchTo('StartView');
  }

  finish = () => {
    set('runTime', this.getRunTime());
    exercise.stop();
    Application.switchTo('FinishView');
  }

  update = (evt) => {
    this.distance = Location.getDistanceRun();
    this.time = evt.date;
    
    this.render();
  };

  togglePaceMode = () => {
    this.paceMode = this.paceMode === CURRENT ? AVERAGE : CURRENT;
    this.update({ evt: new Date() });
  };

  getRunTime() {
    const startTime = Math.floor(get('startTime').getTime() / 1000);
    const now = Math.floor(new Date().getTime() / 1000);
    return now - startTime;
  }

  getAveragePace() {
    if (this.distance === 0) return 0;
    return this.getRunTime() / (this.distance / 1000);
  }

  getPace() {
    if (this.paceMode === CURRENT) {
      return exercise.stats ? exercise.stats.pace.current : null;
    } else {
      return this.distance > 0 ? this.getAveragePace() : null;
    }
  }

  getPredictedFinishTime() {
    const pace = this.getPace();
    const remainingDistance = routeDistance - this.distance;

    if (pace === null) return null;

    if (this.paceMode === CURRENT) {
      if (pace === 0) return null;
      return this.getRunTime() + pace * remainingDistance / 1000;
    } else {
      return pace * routeDistance / 1000;
    }
  }

  onRender() {
    this.runDistanceDisplay.text = this.distance === null ? '' : `${(this.distance / 1000).toFixed(2)}km`;
    this.runTimeDisplay.text = formatDuration(this.getRunTime());
    
    const progressBarWidth = Math.floor(this.progressBarContainerWidth * this.distance / routeDistance);
    this.progressBar.x = progressBarWidth;
    this.progressBar.width = this.progressBarContainerWidth - progressBarWidth;

    this.runPaceLabel.text = this.paceMode === CURRENT ? 'Pace (current)' : 'Pace (avg)';
    const pace = this.getPace();
    this.runPaceDisplay.text = pace ? `${formatDuration(Math.round(pace))} min/km` : '-';

    const predictedFinishTime = this.getPredictedFinishTime();
    this.runProjectedTimeDisplay.text = predictedFinishTime !== null ? formatDuration(Math.round(predictedFinishTime)) : '-';

    this.finishButton.style.display = this.distance > 13000 ? 'inline' : 'none';

    this.cancelModal.style.display = this.cancelModalVisible ? 'inline' : 'none';
    this.finishModal.style.display = this.finishModalVisible ? 'inline' : 'none';
  }
}

export default RunView;
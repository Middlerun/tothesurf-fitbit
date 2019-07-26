import clock from 'clock';
import document from 'document';
import exercise from 'exercise';
import { preferences } from 'user-settings';

import { Application, View, $at } from './view';
import { zeroPad } from '../common/utils';
import { set } from '../common/sharedState';
import Location from "../common/location";
import { formatDuration } from '../common/time';

const $ = $at('#screen-start');

function getTimeText(time) {
  if (!time) return '';
  let hours = time.getHours();
  if (preferences.clockDisplay === "12h") {
    // 12h format
    hours = hours % 12 || 12;
  } else {
    // 24h format
    hours = zeroPad(hours);
  }
  let mins = zeroPad(time.getMinutes());
  return `${hours}:${mins}`;
}

function getCountdownText(time, endTime) {
  if (!time || !endTime) return '';
  const endUnix = Math.floor(endTime.getTime() / 1000);
  const nowUnix = Math.floor(time.getTime() / 1000);
  const diff = endUnix - nowUnix;
  if (diff <= 0) return 'Started!';
  return formatDuration(diff);
}

function getNextStartGroup(time) {
  if (!time) return { name: null, start: null };
  const t = (h, m) => h * 60 + m;
  const min = t(time.getHours(), time.getMinutes());
  const makeDate = (h, m) => new Date(time.getYear(), time.getMonth(), time.getDate(), h, m);
  
  if (min < t(7,  0)) return { name:  null,    start: null };
  if (min < t(7, 52)) return { name: 'Wheelchair', start: makeDate(7, 50) };
  if (min < t(7, 58)) return { name: 'Red',    start: makeDate(7, 55) };
  if (min < t(8, 10)) return { name: 'Green',  start: makeDate(8,  5) };
  if (min < t(8, 35)) return { name: 'Blue',   start: makeDate(8, 30) };
  if (min < t(9, 15)) return { name: 'Yellow', start: makeDate(9, 10) };
  if (min < t(9, 55)) return { name: 'Orange', start: makeDate(9, 35) };
  return { name: null, start: null };
}

function startRun() {
  set('startTime', new Date());

  if (exercise.state === 'stopped') {
    exercise.start('run', {
      autopause: false,
      gps: true,
    });
  }
  
  Application.switchTo('RunView');
}

class StartView extends View {
  el = $();
  timeLabel = $('#start-current-time');
  groupStartLabel = $('#start-group-start-label');
  groupCountdownLabel = $('#start-group-countdown');
  startButton = $('#start-btn');
  time = null;

  onMount() {
    clock.granularity = 'seconds';
    clock.ontick = (evt) => {
      this.time = evt.date;
      this.render();
    }
    
    Location.watchLocationStart();
    
    this.startButton.onclick = startRun;
  }

  onUnmount() {
    clock.granularity = 'off';
    clock.ontick = null;
  }

  onRender() {
    this.timeLabel.text = getTimeText(this.time);
    const nextGroup = getNextStartGroup(this.time);
    this.groupStartLabel.text = nextGroup.name ? `${nextGroup.name} group start:` : '';
    this.groupCountdownLabel.text = getCountdownText(this.time, nextGroup.start);
  }
}

export default StartView;
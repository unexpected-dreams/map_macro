
const songs = {
    Oxide: {
        bpm: 125,
        src: "./assets/Oxide.m4a",
        length: 10000,
        howl_delay: 300,
        beats: [
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
            480,
        ],
    },
    DeepSeaBass: {
        src: "./assets/DeapSeaBass.mp3",
        bpm: 125,
        interval: 476,
        beats: [
            476,
            476,
            476,
            476,
            476,
            476,
            476,
            476,
            476,
            476,
            476,
            476,
            476,
            476,
            476,
            476,
            476,
            476,
            476,
            476,
            476,
            476,
            476,
            476,
            476,
            476,
            476,
            476,
            476,
            476,
            476,
            476,
            476,
            476,
            476,
            476,
            476,
            476,
            476,
            476,
            476,
            476,
            476,
            476,
            476,
            476,
            476,
            476,
            476,
            476,
            476,
            476,
            476,
            476,
            476,
            476,
            476,
            476,
            476,
            476,
            476,
            476,
            476,
            476,
            476,
            476,
            476,
            476,
            476,
            476,
            476,
            476,
            476,
            476,
            476,
            476,
            476,
            476,
        ],
    },
    Magnetize: {
        src: "./assets/Magnetize.mp3",
        howl_delay: -150,
        interval: 401,
        beats: [
            0,
            1720,
            1700,
            1604,
            1554,
            1604,
            1604,
            3204,
            401,
            401,
            401,
            401,
            401,
            401,
            401,
            401,
            401,
            401,
            401,
            401,
            401,
            401,
            401,
            401,
            401,
            401,
            401,
            401,
            401,
            401,
            401,
            401,
            401,
            401,
            401,
            401,
            401,
            401,
            401,
            401,
            401,
            401,
            401,
            401,
            401,
            401,
            401,
            401,
            401,
            401,
            401,
            401,
            401,
            401,
            401,
            401,
            401,
            401,
            401,
            401,
            401,
            401,
            401,
        ],
    },
};
const hearts = {};
const howls = {};
setup.hearts = hearts;
setup.howls = howls;

const meter_interval = 700;
const nav_interval = 0;
class heart {
    constructor(heartid, songid) {

        hearts[heartid] = this;
        this.heartid = heartid;
        this.songid = songid;
        this.running = false;
        this.check_interval = 30;

        const song = songs[this.songid];
        this.beat_interval = song.interval ?? (60000 / song.bpm);
        $('.nav').css({
            '--animDur': this.beat_interval + "ms",
        });
        $('.meter').css({
            '--animDur': meter_interval + "ms",
        });
        howls[heartid] = new Howl({
            src: [song.src],
            html5: true,
            autoloop: true,
        });
        this.queue = [{
            t: song.howl_delay,
            pump: "pump_howl"
        }];
        let t = 0;
        for (const b of song.beats) {
            t +=b;
            this.queue.push({
                t: t - nav_interval,
                pump: "pump_nav",
            });
            this.queue.push({
                t: t - meter_interval,
                pump: "pump_meter",
            });
        }
        this.queue.sort( (a,b) => a.t - b.t );
        const t_lowest = this.queue[0].t * -1;
        this.queue.forEach( i => i.t += t_lowest );
        console.log(this.queue);
    }
    start() {
        this.running = true;
        this.t_start = Date.now();
        this.c = 0;
        this.i = 0;

        this.check();
    }
    stop() {
        this.running = false;
        howls[this.heartid].stop();
    }
    check() {
        if (this.running) {

            this.c++;
            console.log(this.c, Date.now() - this.t_start);
            const q_this = {...this.queue[this.i]};
            if ((Date.now() - this.t_start) > q_this.t) {
                this.pump();
            }

            const t_expected = this.t_start + this.c * this.check_interval;
            const t_drift = Date.now() - t_expected;

            const check = this.check.bind(this);
            setTimeout( function() {
                check();
            }, Math.max(this.check_interval - t_drift, 0))
            
            this.c++;
        }
    }
    pump() {
        const q_this = {...this.queue[this.i]};
        this[q_this.pump]();
        console.log(q_this);
        this.i++;
    }
    pump_howl() {
        howls[this.heartid].play();
    }
    pump_meter() {
        const i = this.i;
        $(document.createElement('div'))
                .addClass('meterBar left')
                .attr('data-i',i)
                .appendTo('#meter1');
        $(document.createElement('div'))
                .addClass('meterBar right')
                .attr('data-i',i)
                .appendTo('#meter1');
        $(document.createElement('div'))
                .addClass('meterBar left')
                .attr('data-i',i)
                .appendTo('#meter2');
        $(document.createElement('div'))
                .addClass('meterBar right')
                .attr('data-i',i)
                .appendTo('#meter2');
        setTimeout( function() {
            $(`.meterBar[data-i="${i}"]`).remove();
        }, meter_interval);
    }
    pump_nav() {
        $('.nav').removeClass('beat');
        setTimeout( function() {
            $('.nav').addClass('beat');
        }, 0);
    }

    static record(code_start, code_stop, code_special) {
        const time = [];
        const beats = [];
        const special = [];
        $(document).on('keydown.heart', function(ev) {
            if (ev.code === code_stop) {
                $(document).off('keydown.heart');
                console.log({time, special, beats});
            }
            else if (ev.code === code_start) {
                if (beats.length === 0) {
                    beats.push(0);
                    time.push(Date.now());
                }
                else {
                    beats.push(Date.now() - time[time.length-1]);
                    time.push(Date.now());
                }
            }
            else if (ev.code === code_special) {
                special.push(beats.length - 1);
            }
        });
    }
}
// setup.Oxide = new heart('oxide','Oxide');
// setup.DeepSeaBass = new heart('deapseabass','DeepSeaBass');
setup.Magnetize = new heart('magnetize','Magnetize');
window.heart = heart;

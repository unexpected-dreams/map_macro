
const songs = {
    oxide: {
        bpm: 125,
        src: "./assets/oxide.m4a",
        length: 10000,
        beats: [
            1000,
            1000,
            1000,
            1000,
            1000,
            1000,
            1000,
            1000,
            1000,
            1000,
        ],
    },
};

class heart {
    constructor(heartid, songid) {
        this.heartid = heartid;
        this.songid = songid;
        this.running = false;
        this.c_interval = 40;

        const song = songs[this.songid];
        this.b_interval = 60000 / song.bpm;
        $('.nav').css({
            '--animDur': this.b_interval + "ms",
        });
        howls[heartid] = new Howl({
            src: [song.src],
            html5: true,
            autoloop: true,
        });
    }
    start() {
        this.running = true;
        this.t_start = Date.now();
        this.c = 0;
        this.b = 0;
        this.check();
        setTimeout( () => howls[this.heartid].play(), 120)
    }
    stop() {
        this.running = false;
        howls[this.heartid].stop();
    }
    check() {
        if (this.running) {
            const t_expected = this.t_start + this.c * this.c_interval;
            const t_drift = Date.now() - t_expected;
            const check = this.check.bind(this);
            // console.log({t_expected, t_drift});
            this.c++;
            setTimeout( function() {
                check();
            }, this.c_interval - t_drift)

            if (Date.now() > this.t_start + this.b * this.b_interval) {
                this.b++;
                this.beat();
            }
        }
    }
    beat() {
        // console.log('beat');
        // console.log({delta_t: Date.now() - this.t_start});
        $('.nav').removeClass('beat');
        setTimeout( () => $('.nav').addClass('beat'), 0);
    }
    static record(code_start, code_stop) {
        const time = [];
        const beats = [];
        $(document).on('keydown.heart', function(ev) {
            if (ev.code === code_stop) {
                $(document).off('keydown.heart');
                console.log({time, beats});
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
        });
    }

}
const howls = {};
setup.heart = new heart('heart','oxide');
window.heart = heart;


const songs = {
    Oxide: {
        bpm: 125,
        src: "./assets/Oxide.m4a",
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
};
const hearts = {};
const howls = {};

const meter_interval = 476;
class heart {
    constructor(heartid, songid) {

        hearts[heartid] = this;
        this.heartid = heartid;
        this.songid = songid;
        this.running = false;
        this.c_interval = 30;

        const song = songs[this.songid];
        this.b_interval = song.interval ?? (60000 / song.bpm);
        $('.nav').css({
            '--animDur': this.b_interval + "ms",
        });
        $('.meter').css({
            '--animDur': meter_interval + "ms",
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

        const howl = howls[this.heartid];
        setTimeout( function() {
            howl.play();
        }, 300)
    }
    stop() {
        this.running = false;
        this.howl.stop();
    }
    check() {
        if (this.running) {

            if (Date.now() > this.t_start + this.b * this.b_interval) {
                this.beat_meter();
                this.beat_nav();
                this.b++;
            }

            const t_expected = this.t_start + this.c * this.c_interval;
            const t_drift = Date.now() - t_expected;

            const check = this.check.bind(this);
            setTimeout( function() {
                check();
            }, Math.max(this.c_interval - t_drift, 0))
            
            this.c++;
        }
    }
    beat_meter() {
        const beat_number = this.b;
        $(document.createElement('div'))
                .addClass('meterBar left')
                .attr('data-beat',beat_number)
                .appendTo('#meter1');
        $(document.createElement('div'))
                .addClass('meterBar right')
                .attr('data-beat',beat_number)
                .appendTo('#meter1');
        $(document.createElement('div'))
                .addClass('meterBar left')
                .attr('data-beat',beat_number)
                .appendTo('#meter2');
        $(document.createElement('div'))
                .addClass('meterBar right')
                .attr('data-beat',beat_number)
                .appendTo('#meter2');
        setTimeout( function() {
            $(`.meterBar[data-beat=${beat_number}]`).remove();
        }, meter_interval);
    }
    beat_nav() {
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
setup.Oxide = new heart('oxide','Oxide');
setup.DeepSeaBass = new heart('deapseabass','DeepSeaBass');
// heart.record("Numpad3","Numpad6","KeyZ");

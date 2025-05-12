import videojs from "video.js";
import "videojs-hls-quality-selector";

export default {

	name: 'VideoPlayer',

	props: {
		options: {
			type: Object,
			default() {
			return {};
			}
		}
	},

	data() {
		return {
			player: null,
		}
	},

	methods: {
		setup() {
			this.$2watch("$refs.videoPlayer").then(() => {
				this.player = videojs(this.$refs.videoPlayer, this.options, () => {
					this.player.log('onPlayerReady', this);
				});
				this.player.hlsQualitySelector({
					displayCurrentQuality: true,
				});
			}).catch(e => { 
				console.error(e);
			});
		},
	},

	mounted() {
		this.setup();
	},

	beforeDestroy() {
		if (this.player) {
			this.player.dispose();
		}
	}
}
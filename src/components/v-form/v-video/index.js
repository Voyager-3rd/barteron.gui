import VideoPlayer from "@/components/video-player/index.vue";

export default {
	name: "Vvideo",

	components: {
		VideoPlayer,
	},

	props: {
		url: {
			type: String,
			default: null
		},
	},

	data() {
		return {
			state: "empty",
			currentUrl: this.url,
			error: null,
			videoInfo: null,
			processingCheckInterval: null,
		}
	},

	inject: ["dialog"],
	
	computed: {
		videoOptions() {
			return {
				autoplay: false,
				controls: true,
				disablePictureInPicture: true,
				enableDocumentPictureInPicture: false,
				controlBar: {
					fullscreenToggle: false,
					pictureInPictureToggle: false,
				},
				userActions: {
					doubleClick: false,
					hotkeys: false,
				},
			};
		},
	},

	methods: {
		changeStateTo(newState) {
			this.state = newState;

			switch (this.state) {
				case "readyToUpload":

					this.currentUrl = null;
					this.videoInfo = null;
					this.error = null;

					this.updateSourceAsync();
					break;
			
				case "processingOfUploadedVideo":
					this.waitForVideoProcessing();
					break;

				case "videoProcessingFailed":
					break;
						
				case "videoUploaded":
					this.updateSourceAsync();
					break;
					
				case "errorState":
					break;
			
				default:
					break;
			};

		},

		uploadingVideoDialog() {
			this.sdk.uploadingVideoDialog().then(result => {
				this.currentUrl = result?.link;
				if (this.currentUrl) {
					this.sdk.getVideoInfo([this.currentUrl], true).then(items => {
						this.videoInfo = items?.[0];
						this.changeStateTo("processingOfUploadedVideo");
					}).catch(e => { 
						this.error = e;
						this.changeStateTo("errorState");
					});
				}
			});
		},

		waitForVideoProcessing() {
			this.processingCheckInterval = setInterval(() => {
				this.sdk.getVideoInfo([this.currentUrl], true).then(items => {
					this.videoInfo = items?.[0];
					const 
						stateId = this.videoInfo?.state?.id,
						isPublished = (stateId === 1),
						isTranscoding = (stateId === 2 || stateId === 3),
						isFailed = (stateId === 7);
					if (isPublished) {
						this.stopVideoProcessingChecking();
						this.changeStateTo("videoUploaded");
					} else if (isTranscoding) {

					} else if (isFailed) {
						this.stopVideoProcessingChecking();
						this.changeStateTo("videoProcessingFailed");
					};
				}).catch(e => { 
					this.stopVideoProcessingChecking();
					this.error = e;
					this.changeStateTo("errorState");
				});
			}, 20_000);
		},

		stopVideoProcessingChecking() {
			if (this.processingCheckInterval) {
				clearInterval(this.processingCheckInterval);
				this.processingCheckInterval = null;
			};
		},

		updateSourceAsync() {
			this.$2watch("$refs.videoPlayer?.player").then(player => {
				this.updateSourceForPlayerAsync(player);
			}).catch(e => { 
				this.error = e;
				this.changeStateTo("errorState");
			});
		},

		updateSourceForPlayerAsync(player) {
			new Promise(resolve => {
				if (this.currentUrl && !(this.videoInfo)) {
					return this.sdk.getVideoInfo([this.currentUrl]).then(items => {
						this.videoInfo = items?.[0];
						resolve();
					});
				} else {
					resolve();
				}
			}).then(() => {
				const src = this.videoInfo?.playlistUrl || null;
				player.src([{ src }]);
			}).catch(e => { 
				this.error = e;
				this.changeStateTo("errorState");
			});
		},

		removeVideoEvent() {
			this.dialog?.instance
				.view("question", this.$t("dialogLabels.video_delete"))
				.then(state => {
					if (state) {
						this.removeVideo();
					};
				});
		},

		removeVideo() {
			this.stopVideoProcessingChecking();

			this.sdk.removeVideo(this.currentUrl).then(() => {
				this.changeStateTo("readyToUpload");
			}).catch(e => {
				this.showError(e);
			});
		},

		// /**
		//  * Check at least one photo attached
		//  */
		// validate() {
		// 	if (!this.max) {
		// 		return this.files.length;
		// 	} else {
		// 		return this.files.length && this.files.length <= this.max;
		// 	}
		// },

		// /**
		//  * Serialize files to FormData
		//  * 
		//  * @returns {Object}
		//  */
		// serialize() {
		// 	const formData = new FormData();

		// 	this.files.forEach(file => formData.append(file.id, file.image));

		// 	return Object.fromEntries(formData.entries());
		// }
	},

	mounted() {
		if (this.currentUrl) {
			this.changeStateTo("videoUploaded");
		} else {
			this.changeStateTo("readyToUpload");
		};
		



		// const link = "peertube://test.peertube.pocketnet.app/b5972eca-5e8b-4159-8fc5-b655f9169826";
		// this.sdk.getVideoInfo([link]).then(res => {
		// 	console.log('getVideoInfo !!!!!!!!!!!!!!!!!!!!!!!!!!', res);
			
		// 	const playlistUrl = res[0]?.data.original.streamingPlaylists[0]?.playlistUrl;
		// 	const thumbnail = res[0]?.data.thumbnail;

		// 	// Vue.set(this.videoOptions, "sources", [{src: playlistUrl}]);
		// 	// console.log('this.videoOptions', this.videoOptions);
			
			
		// });

	},

}
import Score from "@/components/score/index.vue";
import Comment from "@/components/votes/comment.vue";
import Loader from "@/components/loader/index.vue";
import ModerationRequestDialog from "@/components/voting-moderation/moderation-request-dialog/index.vue";
import Vue from 'vue';

export default {
	name: "Votes",

	components: {
		Loader,
		Score,
		Comment,
		ModerationRequestDialog,
	},

	props: {
		offerInfo: {
			type: Boolean,
			default: false
		},
		compact: {
			type: Boolean,
			default: false
		},
		header: {
			type: Boolean,
			default: true
		},
		form: {
			type: Boolean,
			default: false
		},
		item: {
			type: Object,
			default: () => ({})
		},
	},

	data() {
		return {
			isOfferScoreConfirm: false,
			isOfferScoreLoading: false,
			isCommentLoading: false,
			score: 0,
			isChatLoading: false,
			commentFieldShown: false,
		}
	},

	inject: ["dialog", "lightboxContainer"],

	computed: {
		details() {
			return this.sdk.barteron.details[this.item?.hash];
		},

		offerScores() {
			return this.details?.offerScores || [];
		},

		comments() {
			return this.details?.comments || [];
		},

		offerExists() {
			return (this.item?.hash?.length >= 64);
		},

		isMyOffer() {
			return this.item?.address === this.sdk.address;
		},
	},

	methods: {
		addPendingActions() {
			this.sdk.getVoteActions().then(actions => {
				(actions || []).forEach(action => {
					const
						forThisOffer = (
							(action.expObject.type === "upvoteShare" 
								&& action.expObject.share === this.item?.hash)
							|| (action.expObject.type === "comment" 
								&& action.expObject.postid === this.item?.hash)
						),
						isValid = action.transaction,
						isRelay = !(action.completed || action.rejected);
	
					if (forThisOffer && isValid && isRelay) {
						if (action.expObject.type === "upvoteShare" && !(this.hasRelayOfferScore())) {
							const element = this.createRelayOfferScore(action);
							this.score = element.value;
							this.offerScores.push(element);
						} else if (action.expObject.type === "comment" && !(this.hasRelayComment())) {
							const element = this.createRelayComment(action);
							this.comments.push(element);
						}
					}
				});

			}).catch(e => {
				console.error(e);
			});
		},

		createRelayOfferScore(action) {
			return new this.sdk.models.OfferScore({
				hash: action.transaction,
				offerId: action.expObject.share,
				address: this.sdk.address,
				value: action.expObject.value,
				relay: true,
			});
		},

		createRelayComment(action) {
			return new this.sdk.models.Comment({
				hash: action.transaction,
				postid: action.expObject.postid,
				parentid: action.expObject.parentid,
				address: this.sdk.address,
				message: action.expObject.msgparsed?.message,
				info: action.expObject.msgparsed?.info,
				relay: true,
			});
		},

		/**
		 * Store vote
		 * 
		 * @param {Number} score
		 */
		async vote(score) {
			if (this.sdk.willOpenRegistration()) {
				this.resetScore();
				return;
			};

			if (score < 4) {
				let success = this.sdk.metaDataAvailable() && await this.checkReputation();
				if (success) {
					const accessData = await this.findAccessData();

					const 
						accessAllowed = accessData?.status === "allowed",
						accessRejected = accessData?.status === "rejected",
						rejectionReason = accessData?.rejectionReason || "",
						accessScore = accessData?.score || 0,
						accessError = accessData?.error,
						canUpdateAccount = !(this.account.relay);

					if (accessAllowed) {
						if (score < accessScore) {
							success = false;
							this.showWarning(this.$t("voteLabels.score_is_lower_than_allowed_score", {score, accessScore}));
						} else {
							// passed
						}
					} else if (accessRejected) {
						success = false;
						this.showWarning(this.$t("voteLabels.access_to_score_rejected_by_moderator"));
					} else {
						success = false;
						if (!(accessError)) {
							const requestData = this.findRequestData();
							if (requestData) {
								this.showWarning(this.$t("voteLabels.waiting_for_moderator_response"));
							} else {
								if (canUpdateAccount) {
									this.showModerationRequestDialog(score);
								} else {
									this.showWarning(this.$t("moderationRequestLabels.cannot_create_request_while_account_is_updating"));
								};
							};
						};
					};
				};

				if (!(success)) {
					this.resetScore();
					return;
				};
			};

			if (!(this.isOfferScoreLoading)) {
				this.isOfferScoreLoading = true;
				this.score = score;
				this.removeRejectedOfferScores();
	
				this.sdk.setBrtOfferVote({
					offerId: this.item.hash,
					address: this.item.address,
					value: score
				}).then((action) => {
					if (!(this.isComponentAlive)) return;
					const element = this.createRelayOfferScore(action);
					this.offerScores.push(element);
					this.commentFieldShown = true;
					setTimeout(() => {
						this.isComponentAlive && this.scrollToElement("#input-comment");
					}, 300);
				}).catch(e => {
					if (!(this.isComponentAlive)) return;
					this.resetScore();
					this.showError(e);
				}).finally(() => {
					if (!(this.isComponentAlive)) return;
					this.isOfferScoreLoading = false;
				});
			};
		},

		async checkReputation() {
			let result = true;

			try {
				const 
					bastyonAccount = await this.sdk.getUserProfile(this.address),
					reputation = 100; // bastyonAccount?.reputation || 0;
					// TODO: DEBUG reputation !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

				if (reputation < 100) {
					throw new Error("error#60");
				};
			} catch (error) {
				result = false;
				this.showError(error);
			};

			return result;
		},

		async findAccessData() {
			let result = null;

			const searchData = {
				createdAt: Date.now() - 7 * 24 * 3600 * 1000,
				offerId: this.item.hash,
				userAddress: this.address,
			};

			const 
				settings = this.sdk.getSupportSettings(),
				addresses = settings.moderatorAddresses;

			let accounts = null;
			try {
				accounts = await this.sdk.getBrtAccounts(addresses);
			} catch (e) {
				result = {
					error: e,
				};
			};

			if (accounts) {
				const 
					allAccountsAccessItems = accounts.map(m => m?.metaData?.votingModeration?.accessItems).filter(f => f),
					flatItems = [].concat(...allAccountsAccessItems);
				
				result = flatItems.filter(f => f 
					&& f.createdAt > searchData.createdAt
					&& f.offerId === searchData.offerId
					&& f.userAddress === searchData.userAddress
				).pop();
			};

			return result;
		},

		findRequestData() {
			const 
				searchData = {
					createdAt: Date.now() - 7 * 24 * 3600 * 1000,
					offerId: this.item.hash,
				},
				items = this.account?.metaData?.votingModeration?.requestItems || [];

			return items.filter(f => f
				&& f.createdAt > searchData.createdAt
				&& f.offerId === searchData.offerId 
			).pop();
		},

		showModerationRequestDialog(score) {
			const ComponentClass = Vue.extend(ModerationRequestDialog);
			const instance = new ComponentClass({
				propsData: {
					score,
				},
			});
			
			instance.$on('onHide', vm => {
			});

			instance.$on('onSubmit', requestData => {
				instance.hide();
				setTimeout(() => {
					this.submitModerationRequest(requestData);
				}, 300);
			});

			instance.$mount();
			this.lightboxContainer().appendChild(instance.$el);
			instance.show();
		},

		async submitModerationRequest(requestData) {
			this.dialog?.instance.view("load", this.$t("dialogLabels.search_for_available_moderator"));

			const moderatorData = await this.getRandomModerator();

			const
				moderatorError = moderatorData?.error,
				moderatorAddress = moderatorData?.address;

			if (moderatorError) {
				this.showError(moderatorError);
				return;
			} else if (!(moderatorAddress)) {
				this.showWarning(this.$t("moderationRequestLabels.available_moderator_not_found"));
				return;
			};

			const queryParams = {
				offer: this.item.hash,
				user: this.address,
				score: requestData.score,
			};

			const 
				titleMessage = this.$t("moderationRequestLabels.moderation_request_title_message"),
				reason = requestData.reason,
				paramsString = new URLSearchParams(queryParams).toString(),
				requestLink = this.sdk.appLink(`barter/moderation?${ paramsString }`);

			let sendingFailed = false;

			this.isChatLoading = true;
			this.dialog?.instance.view("load", this.$t("dialogLabels.opening_room"));
			this.sendMessage({
				members: [moderatorAddress],
				messages: [titleMessage, reason, requestLink],
				openRoom: true
			}).then(() => {
				this.dialog?.instance.hide();
			}).catch(e => {
				sendingFailed = true;
				this.showError(e);
			}).finally(() => {
				this.isChatLoading = false;
			});

			const addRequestItemToProfile = !(sendingFailed);
			if (addRequestItemToProfile) {
				const 
					metaData = JSON.parse(JSON.stringify(this.account?.metaData || {})),
					votingModeration = metaData.votingModeration || {},
					requestItems = votingModeration.requestItems || [];

				requestItems.push({
					createdAt: Date.now(),
					offerId: this.item.hash,
				});
				
				votingModeration.requestItems = requestItems;
				metaData.votingModeration = votingModeration;

				this.account.set({ metaData }).catch(e => {
					console.error(e);
				});
			};
		},

		async getRandomModerator() {
			let result = null;

			const 
				settings = this.sdk.getSupportSettings(),
				addresses = settings.moderatorAddresses;

			let accounts = null;
			try {
				accounts = await this.sdk.getBrtAccounts(addresses);
			} catch (e) {
				result = {
					error: e,
				};
			};

			if (accounts) {
				const 
					items = accounts.filter(f => f 
						&& f.address !== this.address 
						&& f.metaData?.votingModeration?.moderator?.status === "available"
					),
					target = items[Math.floor(Math.random() * items.length)];

				if (target) {
					result = {
						address: target.address,
					};
				};
			};

			return result;
		},

		resetScore() {
			this.score = 0;
			this.$refs.offerScore?.reset();
		},

		/**
		 * Send comment
		 */
		async submitComment() {
			if (this.sdk.willOpenRegistration()) return;

			const
				form = this.$refs.form,
				feed = this.$refs.vote;

			await feed?.trimContentAsync();
				
			const formData = form.serialize();

			if (form.validate() && !this.isCommentLoading) {
				this.isCommentLoading = true;
				this.removeRejectedComments();

				this.sdk.setBrtComment({
					postid: this.item.hash,
					msgparsed: {
						message: formData.vote,
						info: this.score?.toFixed() || ""
					}
				}).then((action) => {
					if (!(this.isComponentAlive)) return;
					const element = this.createRelayComment(action);
					feed.content = "";
					this.comments.push(element);
					this.score = 0;
				}).catch(e => { 
					if (!(this.isComponentAlive)) return;
					this.showError(e);
				}).finally(() => {
					if (!(this.isComponentAlive)) return;
					this.isCommentLoading = false;
				});
			}
		},

		// when user clicked back button in browser and then forward button 
		// during offer score in relay state
		restoreScoreValueIfNeeded() {
			const element = this.getRelayOfferScore();
			if (element) {
				this.score = element.value;
			}
		},

		starsValue() {
			return (this.hasRelayOfferScore() 
				|| this.isOfferScoreLoading 
				|| this.isOfferScoreConfirm) ? this.score : null;
		},

		completedOfferScoresAverage() {
			const items = this.offerScores.filter(f => f.completed);
			return items.reduce((a, v) => {
				return a += v?.value;
			}, 0) / (items.length || 1);
		},

		hasRelayOfferScore() {
			return this.offerScores.some(f => f.relay);
		},

		getRelayOfferScore() {
			return this.offerScores.filter(f => f.relay).pop();
		},

		hasRejectedOfferScore() {
			return this.offerScores.some(f => f.rejected);
		},

		removeRejectedOfferScores() {
			const removingItems = this.offerScores.filter(f => f.rejected);
			removingItems.forEach(element => {
				const index = this.offerScores.indexOf(element);
				this.offerScores.splice(index, 1);
				element.destroy();
			})
		},

		offerScoresCount() {
			return this.offerScores.filter(f => f.completed).length;
		},

		voteable() {
			return this.offerExists 
				&& !(this.isMyOffer)
				&& this.form
				&& !(this.offerScores.some(f => f.address === this.sdk.address && (f.relay || f.completed))
					|| this.isOfferScoreLoading
					|| this.isOfferScoreConfirm);
		},

		validComments() {
			return this.comments.filter(f => !(f.rejected));
		},

		hasRelayComment() {
			return this.comments.some(f => f.relay);
		},

		hasRejectedComment() {
			return this.comments.some(f => f.rejected);
		},

		removeRejectedComments() {
			const removingItems = this.comments.filter(f => f.rejected);
			removingItems.forEach(element => {
				const index = this.comments.indexOf(element);
				this.comments.splice(index, 1);
				element.destroy();
			})
		},

		commentable() {
			return this.offerExists && this.form;
		},

		showCommentField() {
			this.commentFieldShown = true;
		},

		contactSeller() {
			if (this.isMyOffer) return;
			if (this.sdk.willOpenRegistration()) return;
			
			const 
				sellerAddress = this.item?.address,
				offerLink = this.sdk.appLink(`barter/${ this.item?.hash }`);

			this.isChatLoading = true;
			this.dialog?.instance.view("load", this.$t("dialogLabels.opening_room"));
			this.sendMessage({
				members: [sellerAddress],
				messages: [offerLink],
				openRoom: true
			}).then(() => {
				this.dialog?.instance.hide();
			}).catch(e => {
				this.showError(e);
			}).finally(() => {
				this.isChatLoading = false;
			});
		},
	},

	mounted() {
		this.restoreScoreValueIfNeeded();
		this.addPendingActions();
	},
}
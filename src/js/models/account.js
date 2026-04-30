import Vue from "vue";
import i18n from "@/i18n/index.js";

/**
 * Barteron account object model
 * 
 * @class Account
 */
class Account {
	/**
	 * Initialize model
	 * 
	 * @constructor Account
	 * @param {Object} data
	 */
	constructor(data) {
		/* Extract JSON values and format object */
		const { a, g, s, r, d, m } = JSON.parse(data?.p?.s4 || '{"a":[],"g":"","s":false,"r":0, "d":{}, "m":{}}');
		
		/* Iterable properties */
		this.address = data?.address || data?.s1 || "";
		this.hash = data?.hash || null;
		this.blockHash = data?.blockHash || "";
		this.height = data?.height || 0;
		this.tags = data?.tags || a || [];
		this.geohash = data?.geohash || g || "";
		this.static = data?.static || s || false;
		this.radius = data?.radius || r || 0;
		this.safeDeal = data?.safeDeal || d || {};
		this.metaData = data?.metaData || m || {};
		this.time = data?.time || 0;
		this.type = data?.type || 0;

		/* Hidden properties */
		Object.defineProperties(this, {
			sdk: { value: Vue.prototype.sdk },
			relayProps: {
				value: [],
				writable: true, 
				enumerable: false,
			},
			regdate: { 
				value: data?.regdate || data?.additional?.regdate * 1000 || +new Date, 
				writable: true, 
				enumerable: true,
			},
			ratingSum: { 
				value: data?.ratingSum ?? data?.additional?.rating_sum ?? 0, 
				writable: true, 
				enumerable: true,
			},
			ratingCount: { 
				value: data?.ratingCount ?? data?.additional?.rating_count ?? 0,
				writable: true, 
				enumerable: true,
			},
			rating: { 
				value: data?.rating ?? (data?.additional?.rating ?? 0) / 10, 
				writable: true, 
				enumerable: true,
			},
		});

		this.relay = data?.relay || false;

		this.actionHandler = null;

		const 
			cached = this.sdk.barteron._accounts[this.address], 
			cachedAccount = (cached instanceof Account) && cached,
			needCreate = !(cachedAccount),
			needUpdate = cachedAccount && !(cachedAccount?.relay);

		if (needCreate) {
			Vue.set(this.sdk.barteron._accounts, this.address, this);
			this.action();
		} else if (needUpdate) {
			return cachedAccount.update(this);
		} else {
			return cachedAccount;
		};
	}

	/**
	 * Watch action status
	 */
	action() {
		this.actionHandler = (action) => {
			if (this.address === action?.expObject?.address 
				&& this.sdk.isAccountAction(action)
			) {
				const
					completed = action.completed,
					rejected = action.rejected,
					relay = !(completed || rejected);
				
				this.update({ relay }, {updateRelayProps: false});

				const needReset = rejected;
				if (needReset) {

					const message = i18n.t("dialogLabels.account_saving_error");
					this.sdk.alertMessage(message);

					this.sdk.getBrtAccount(this.address).catch(e => {
						console.error(e);

						const message = this.sdk.errorMessage(e);
						this.sdk.alertMessage(message);
					});

				};
			}
		}

		this.sdk.on("action", this.actionHandler);
	}


	/**
	 * Update model properties
	 * 
	 * @param {Object} [data]
	 * 
	 * @returns {Account}
	 */
	update(data, options = {updateRelayProps: true}) {
		if (Object.keys(data || {}).length) {

			if (options?.updateRelayProps) {
				const relayData = {
					tags: data?.tags && (JSON.stringify(data.tags) !== JSON.stringify(this.tags)),
					safeDeal: data?.safeDeal && (JSON.stringify(data.safeDeal) !== JSON.stringify(this.safeDeal)),
					votingModeration: data?.metaData?.votingModeration && (JSON.stringify(data.metaData?.votingModeration) !== JSON.stringify(this.metaData?.votingModeration)),
				};

				this.relayProps = Object.keys(relayData).filter(key => relayData[key]);
			};
	
			for (const p in data) {
				this[p] = data[p];
			};
		};

		return this;
	}

	isRelayProp(prop) {
		return prop && this.relayProps?.includes(prop);
	}

	/**
	 * Store model data
	 * 
	 * @param {Object} [data]
	 */
	set(data) {
		return this.sdk.setBrtAccount({ ...this.update(data) });
	}

	/**
	 * Destroy model data
	 */
	destroy() {
		this.sdk.off("action", this.actionHandler);
		this.actionHandler = null;
		Vue.delete(this.sdk.barteron._accounts, this.address);
	}
};

export default Account;
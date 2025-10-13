import VueI18n from "@/i18n/index.js";

class RequestIdError extends Error {
	constructor(requestName, requestSource, id, currentId) {
		const message = `Request "${requestName}" from source "${requestSource}" rejected by id = ${id}, current id = ${currentId}`;
		super(message);
		this.name = this.constructor.name;
		this.requestName = requestName;
		this.requestSource = requestSource;
		this.id = id;
		this.currentId = currentId;
	}
}

class AppGeolocationPermissionError extends Error {
	constructor(error) {
		const message = VueI18n.t("dialogLabels.app_geolocation_permission_error");
		super(message);
		this.error = error;
	}
}

class GeolocationRequestError extends Error {
	constructor(error) {
		let message = error.message;
		if (message === "location:notavailable") {
			message =  VueI18n.t("dialogLabels.platform_geolocation_permission_error");
		}
		super(message);
		this.error = error;
	}
}

class UploadImagesError extends Error {
	constructor(error) {
		let message = error.message;
		const 
			imagesMaxCountExceeded = (/images:max:\d+$/.test(message)), // example "images:max:10"
			imagesFailedUploadNumbers = (/images:failedUploadNumbers:.+$/.test(message)); // example "images:failedUploadNumbers:2,3,5"

		if (imagesMaxCountExceeded) {
			message = VueI18n.t("dialogLabels.images_max_count_exceeded_error");
		} else if (imagesFailedUploadNumbers) {
			const 
				rawNumbers = message.split(":").pop(),
				numbers = rawNumbers.split(",").join(", ");

			message = VueI18n.t("dialogLabels.images_failed_upload_numbers_error", {numbers});
		}
		super(message);
		this.error = error;
	}
}

export default { 
	RequestIdError, 
	AppGeolocationPermissionError, 
	GeolocationRequestError,
	UploadImagesError
}
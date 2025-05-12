<template>
	<div class="video-uploader">

		<div class="video-query">

			<div 
				v-if="state === 'readyToUpload'"
				class="ready-to-upload"
				@click="uploadingVideoDialog"
			>
				<i class="fa fa-plus"></i>
				<span>{{ $t('videosLabels.upload_video') }}</span>
			</div>

			<div 
				v-if="state === 'processingOfUploadedVideo'"
				class="processing-of-uploaded-video"
			>
				<picture>
					<img :src="videoInfo?.thumbnail" :alt="videoInfo?.name || 'thumbnail'">
				</picture>

				<div class="processing-status-holder">
					<div class="processing-status">
						<i class="fa fa-spinner fa-spin"></i>
						{{ $t('videosLabels.video_is_being_processed') }}
					</div>
				</div>

				<i 
					class="fa fa-times remove" 
					@click="removeVideoEvent"
				></i>
			</div>

			<div 
				v-if="state === 'videoUploaded'"
				class="video-uploaded"
			>
				<VideoPlayer 
					ref="videoPlayer"
					:options="videoOptions"
				/>
				<i 
					class="fa fa-times remove" 
					@click="removeVideoEvent"
				></i>
			</div>


			<div 
				v-if="state === 'errorState'"
				class="error-state"
			>
				<p>{{ error.message }}</p>
			</div>

		</div>

		<!-- <span
			class="status"
			v-if="files.length"
		>{{
			$tc('photosLabels.status', files.length || 0, {
				count: files.length,
				size: filesSizeCalculated
					? formatBytes(files.reduce((i, f) => i + (f.fileSize || 0), 0))
					: $t('photosLabels.size_is_calculated').toLowerCase()
			})
		}}</span> -->
	</div>
</template>

<style lang="sass" src="./index.sass"></style>
<script src="./index.js"></script>
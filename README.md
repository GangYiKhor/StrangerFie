# StrangerFie

This prototype is built for a concept of group photo-taking with strangers. Anyone is free to stop by and take a photo. After the photo is completed, it can be saved for other purposes _(E.g. publish on social media platforms)._

This is a prototype built for Interaction Design Coursework of BSc IT at UWE, Bristol

Split into Frontend and Backend for Azure Cloud Deployment
[Frontend](https://github.com/GangYiKhor/StrangerFie_Frontend)
[Backend](https://github.com/GangYiKhor/StrangerFie_Backend)

## Environment Settings

- Node Version `v20.3.1`
- PostgreSQL Version `v15.3`

## ENV Variables

```bash
NODE_ENV="production" # Set as development for dev server
BG_REMOVE_METHOD="local" # If the app fails, try change this to "api"
RAPID_API_KEY="YOUR_RAPID_API_KEY" # Get your API key on RapidAPI.com
POSTGRES_PRISMA_URL="YOUR_POSTGRES_DB_URL"

# If you are running docker compose, you may set a dedicated database
POSTGRES_DB="strangerfie"
POSTGRES_USER="postgres"
POSTGRES_PASSWORD="root"
POSTGRES_PORT="5431"
```

Get your API Key on [RapidAPI.com](https://rapidapi.com/hub)

## Subscribe to Face and Plate Blurer API (Freemium)

Register your account at RapidAPI and subscribe to the Face and Plate Blurer API at [Face and Plate Blurer](https://rapidapi.com/firdavscoder1/api/face-and-plate-blurer).
<br/>
There should be a free subscription version with 100 requests/month limit.

## Subscribe to Background Removal API (Freemium)

Register your account at RapidAPI and subscribe to the Background Removal API at [Background Removal](https://rapidapi.com/api4ai-api4ai-default/api/background-removal4).
<br/>
There should be a free subscription version with 25 requests/month limit. (**2 requests per photo**)

## How to Setup/Run

```bash
# Only run on first time setup
npm install
npx prisma db push
npx prisma generate

# For development server
npm run dev

# For actual deployment server
npm install
npm run build
npm run start

# For docker, Docker need to be installed
docker compose up # First set up
docker compose -f compose-appOnly.yml up # If you are using cloud postgres database or your own postgres database

docker compose start # Subsequent execution
docker compose down --rmi local # Removing the images if not needed anymore
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

<br/>

# Server Endpoints (For Development Purposes)

### Upload Image - `http://localhost:3000/api/uploadBackground`

#### Processes

- Update current group photo background image
- Re-merged previous photos

#### Request [POST]

```ts
body: {
	image: "base64_image_with_encoding_data";
}
```

#### Response

```ts
STATUS 200
NO BODY
```

<hr/>

### Upload Image - `http://localhost:3000/api/uploadFile`

#### Processes

- Remove background
- Blur faces
- Save into database
- Merge with other strangers (Blurred faces)
- Return back merged photo

#### Request [POST]

```ts
body: {
	image: "base64_image_with_encoding_data";
}
```

#### Response

```ts
body: {
	mergedImage: "base64_image_merged_with_strangers",
	onlyCurrentImage: "base64_image_only_current_person",
	id: "current_image_id"
}
```

<hr/>

### Complete Image - `http://localhost:3000/api/completeImage`

#### Processes

- Retrieve the current person's blurred face from database
- Merge with existing combined group photo from database
- Save into database to update
- Return the merged photo

#### Request [POST]

```ts
body: {
	id: "current_image_id";
}
```

#### Response

```ts
body: {
	image: "base64_image_with_blurred_faces",
}
```

<hr/>

### Publish Image - `http://localhost:3000/api/publishImage`

#### Processes

- Retrieve and Merge every previous person's face (Non-blurred)
- Save into database
- Archive all the photos in database
- Send back the merged photo

#### Request [GET]

```ts
"NO PARAMS REQUIRED";
```

#### Response

```ts
body: {
	image: "base64_image",
}
```

<hr/>

### Get Latest Published Image - `http://localhost:3000/api/getLatestPublishedImage`

#### Processes

- Retrieve latest published image

#### Request [GET]

```ts
"NO PARAMS REQUIRED";
```

#### Response

```ts
body: {
	image: "base64_image",
}
```

<hr/>

### Has Published Image - `http://localhost:3000/api/hasPublishedImage`

#### Processes

- Check if there is any published image in the database

#### Request [GET]

```ts
"NO PARAMS REQUIRED";
```

#### Response

```ts
body: {
	status: "boolean",
}
```

<hr/>

### Is Setup - `http://localhost:3000/api/isSetup`

#### Processes

- Check if there is already background image taken

#### Request [GET]

```ts
"NO PARAMS REQUIRED";
```

#### Response

```ts
body: {
	status: "boolean",
}
```

# Other Notes (Docker is not usable)

Although Dockerfile and compose.yaml is provided, this package cannot be packed as a docker image/container.

- One of the library (`@imgly/background-removal-node`) is not executable in any docker image
  - Including `node:20` and `node:20-alpine`
- In `node:20-alpine`
  - An error `__vsnprintf_chk: symbol not found` will be thrown
  - Tried installed library `libc6-compat`, `glibc-2.34-r0`, `glibc-2.35-r1`, `gcompat`, `libstdc++`, `gcc`, `g++`, `musl-dev` and `build-base`
  - Issue still not fixed, if you find any way to fix that, please leave a message
- However, in `node:20`, where gnu version of linux with `glibc` is used
  - An error `free() invalid size` is thrown by `@imgly/background-removal-node`
  - Cause: `.wasm` is not read, and it is `{ }` when `free()` is called
  - Same issue reported by others on the repo as well **_(By 13 April 2024)_**.
    - [Issue 103: Ubuntu support](https://github.com/imgly/background-removal-js/issues/103)
    - [Issue 106: Errors while removing background on deployed server](https://github.com/imgly/background-removal-js/issues/106)

## Updates

Docker can be used now, by switching the `@imgly/background-removal-node` to API calls. However the API limits 25 requests per month (Which is 12 photos for this app only).

`@imgly/background-removal-node` can still be used by specifying `BG_REMOVE_METHOD="local"` in the `.env` file. But, it may not be working on other computers.

class ProfileLoader {

    static profile = null;

    static async load() {

        if (this.profile)
            return this.profile;

        try {

            const url = chrome.runtime.getURL("profile.json");

            const response = await fetch(url);

            if (!response.ok)
                throw new Error("Unable to load profile.json");

            this.profile = await response.json();

            console.log("Profile Loaded");

            return this.profile;

        }
        catch (err) {

            console.error(err);

            return null;

        }

    }

    static async reload() {

        this.profile = null;

        return await this.load();

    }

    static getProfile() {

        return this.profile;

    }

}
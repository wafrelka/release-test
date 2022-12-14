const fs = require("fs");
const path = require("path");

module.exports = async ({github, context}) => {

    const repo = {owner: context.repo.owner, repo: context.repo.repo};
    const name = "latest";
    const sha = context.sha;

    const update_param = {ref: `tags/${name}`, sha, force: true, ...repo};
    const create_param = {ref: `refs/tags/${name}`, sha, ...repo};

    await github.rest.git.updateRef(update_param)
        .catch((err) => { console.warn(err); github.rest.git.createRef(create_param)});

    const {data: releases} = await github.rest.repos.listReleases(repo);
    for(const release of releases) {
        if(release.tag_name === name) {
            await github.rest.repos.deleteRelease({
                release_id: release.id,
                ...repo,
            });
        }
    }

    const {data: release} = await github.rest.repos.createRelease({
        tag_name: name,
        name: name,
        prerelease: true,
        ...repo,
    });

    const fnames = await fs.promises.readdir("artifact");
    for(const fname of fnames) {
        const fpath = path.join("artifact", fname);
        github.rest.repos.uploadReleaseAsset({
            name: fname,
            data: await fs.promises.readFile(fpath),
            release_id: release.id,
            ...repo,
          });
    }
};

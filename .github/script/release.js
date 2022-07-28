module.exports = async ({github, context}) => {

    const repo = {owner: context.repo.owner, repo: context.repo.repo};
    const name = "latest";
    const ref = `refs/tags/${name}`;
    const sha = context.sha;

    await github.rest.git.deleteRef({ref, ...repo}).catch(() => undefined);

    await github.rest.git.createRef({ref, sha, ...repo});

    const {data: releases} = await github.rest.repos.listReleases(repo);
    for(const release of releases) {
        if(release.tag_name === name) {
            await github.rest.repos.deleteRelease({
                release_id: release.node_id,
                ...repo,
            });
        }
    }

    await github.rest.repos.createRelease({
        tag_name: name,
        name: name,
        prerelease: true,
        ...repo,
    });
};

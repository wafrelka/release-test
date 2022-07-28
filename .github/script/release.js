module.exports = async ({github, context}) => {

    const repo = {
        owner: context.repo.owner,
        repo: context.repo.repo,
    };
    const name = context.ref;

    const {data: releases} = await github.rest.repos.listReleases(repo);
    for(const release of releases) {
        if(release.name === name) {
            await github.rest.repos.deleteRelease({
                release_id: release.node_id,
                ...repo,
            });
        }
    }

    await github.rest.repos.createRelease({
        tag_name: context.ref,
        name: name,
        prerelease: true,
        ...repo,
    });
};

module.exports = async ({github, context}) => {

    const repo = {owner: context.repo.owner, repo: context.repo.repo};
    const tag = "latest";

    await github.rest.git.createRef({
        ref: `refs/tags/${tag}`,
        sha: context.sha,
        ...repo,
    });

    const {data: releases} = await github.rest.repos.listReleases(repo);
    for(const release of releases) {
        if(release.tag_name === tag) {
            await github.rest.repos.deleteRelease({
                release_id: release.node_id,
                ...repo,
            });
        }
    }

    await github.rest.repos.createRelease({
        tag_name: tag,
        name: tag,
        prerelease: true,
        ...repo,
    });
};

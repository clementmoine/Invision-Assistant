async function invite(users, removeExisting = false) {
    const projectScope = angular.element('[ng-click="openShareModal()"]').scope();
    
    projectScope.openShareModal();
    projectScope.$apply();

    await new Promise(resolve => setTimeout(resolve, 300));
    
    const inviteModalScope = angular.element('[inv-modal]').scope();

    inviteModalScope.teamMembers.forEach((member) => {
        const shouldInvite = users.includes(member.email) && !member.isSelectedForProject;
        const shouldRemove = !users.includes(member.email) && member.isSelectedForProject && removeExisting;

        if (!shouldInvite && !shouldRemove) {
            return;
        }

        inviteModalScope.toggleTeamMemberSelection(member);
    });

    inviteModalScope.updateTeamMembers();

    inviteModalScope.$apply();
}

// Edit that list of emails
invite(['example@email.com', 'example1@email.com']);

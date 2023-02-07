async function invite(users) {
    const projectScope = angular.element('[ng-click="openShareModal()"]').scope();
    
    projectScope.openShareModal();
    projectScope.$apply();

    await new Promise(resolve => setTimeout(resolve, 300));
    
    const inviteModalScope = angular.element('[inv-modal]').scope();

    inviteModalScope.teamMembers.forEach((member) => {
        if (!users.includes(member.email) || member.isSelectedForProject) {
            return;
        }

        inviteModalScope.toggleTeamMemberSelection(member);
    });

    inviteModalScope.updateTeamMembers();

    inviteModalScope.$apply();
}

// Edit that list of emails
invite(['example@email.com', 'example1@email.com']);

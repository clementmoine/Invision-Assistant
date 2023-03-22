const groups = [
];

function uuidv4() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}

function getUserFromEmail(email) {
    const inviteModalScope = angular.element('[inv-modal]').scope();
    const currentUser = angular.element('body').scope().user;

    return currentUser.email === email ? currentUser : inviteModalScope.teamMembers.find((m) => m.email === email);
}

async function invite(emails, reverse = false) {
    const inviteModalScope = angular.element('[inv-modal]').scope();
    const currentUser = angular.element('body').scope().user;

    emails.forEach((email) => {
        if (currentUser.email === email) {
            return;
        }

        const user = getUserFromEmail(email);

        if (!user) {
            return;
        }

        if ((!reverse && !user.isSelectedForProject) || (reverse && user.isSelectedForProject)) {
            inviteModalScope.toggleTeamMemberSelection(user);
        }
    })

    inviteModalScope.$apply();
}

function insertAfter(newNode, existingNode) {
    existingNode.parentNode.insertBefore(newNode, existingNode.nextSibling);
}

function addGroupNameToUsers() {
    const inviteModal = document.querySelector('[inv-modal]');
    const usersList = inviteModal.querySelector('.user-list');


    // Add the group name next to the user name
    const usersElements = usersList.querySelectorAll('.user-container:not(.processed)');

    usersElements.forEach((userElement) => {
        userElement.classList.add('processed');

        const details = userElement.querySelector('.user-info p').innerText;
        const email = details.split('•').find((p) => p.includes('@')).trim();

        const user = getUserFromEmail(email);
        const group = groups.find((group) => group.members.includes(email));

        if (!user || !group) {
            return;
        }

        userElement.querySelector('h2').innerHTML = `${user.name} • ${group.name}`;
    });
}

function moveSaveBtn() {
    const inviteModal = document.querySelector('[inv-modal]');
    const actions = inviteModal.querySelector('.actions');
    const usersTabContent = inviteModal.querySelector('.tab-content.users');
    
    // Insert the button after the tab contents
    insertAfter(actions, usersTabContent)
}

function createGroupsSearchBar() {
    const inviteModal = document.querySelector('[inv-modal]');
    const search = document.createElement('div');
    search.classList.add('search');

    const searchInput = document.createElement('input');
    searchInput.setAttribute('type', 'text');
    searchInput.setAttribute('autocomplete', 'off');
    searchInput.setAttribute('placeholder', `Search ${groups.length} groups...`);

    const searchFilterCount = document.createElement('span');
    searchFilterCount.classList.add('count');

    searchFilterCount.hidden = true;
    searchFilterCount.innerHTML = `0/${groups.length}`;

    search.append(searchInput, searchFilterCount);

    const groupsTabContent = inviteModal.querySelector('.tab-content.groups')

    groupsTabContent.prepend(search);
}

async function createGroupsTab() {
    const currentUser = angular.element('body').scope().user;
    
    const inviteModal = document.querySelector('[inv-modal]');
    const tabsContainer = inviteModal.querySelector('.tabs');

    // Create a groups tab
    const groupsTabContent = document.createElement('div');

    groupsTabContent.classList.add('groups', 'tab-content');

    const groupsContent = document.createElement('div');

    groupsContent.classList.add('content');

    // Create the list of groups with avatars
    const groupsList = document.createElement('ul');

    groupsList.classList.add('groups-list');

    groupsContent.append(groupsList);

    groupsTabContent.append(groupsContent);

    // Insert the user tab after the tabs container
    insertAfter(groupsTabContent, tabsContainer);

    groups.forEach((group) => {
        const groupElement = document.createElement('li');

        const groupAvatars = document.createElement('ul');
        groupAvatars.classList.add('avatars');

        const existingMembers = group.members

        const hasMore = existingMembers.length > 3;

        existingMembers.slice(0, 3).forEach((member, index) => {
            const user = getUserFromEmail(member);
            
            if (!user || (hasMore && index === 3)) {
                return;
            }

            const memberAvatar = document.createElement('li');
            memberAvatar.setAttribute('id', uuidv4());
            memberAvatar.setAttribute('title', `${user.isProjectMember || user.email === currentUser.email ? '✅' : '⛔️'} ${user.name} ${user.email === currentUser.email ? '(moi)' : ''}`);

            if (!user.hasSystemAvatar) {
                const memberImg = document.createElement('img');

                memberImg.setAttribute('src', user.avatarUrl);

                memberAvatar.append(memberImg);
            } else {
                const memberInitials = document.createElement('span');

                memberInitials.innerHTML = user.initials;
                memberInitials.classList.add('initials');

                memberAvatar.append(memberInitials)
            }
            
            if (user.isProjectMember) {
                memberAvatar.classList.add('is-member');
            }

            groupAvatars.append(memberAvatar);
        })

        if (hasMore) {
            const moreAvatar = document.createElement('li');
            moreAvatar.classList.add('more');
            
            const otherMembers = existingMembers.slice(3, existingMembers.length).map((member) => {
                return getUserFromEmail(member);
            });

            moreAvatar.innerHTML = `+${otherMembers.length}`;

            moreAvatar.setAttribute('id', uuidv4());
            moreAvatar.setAttribute('title', otherMembers.map((user) => `${user.isProjectMember || user.email === currentUser.email ? '✅' : '⛔️'} ${user.name} ${user.email === currentUser.email ? '(moi)' : ''}`).join('\n'));

            groupAvatars.append(moreAvatar);
        } 

        const groupDetail = document.createElement('div');
        groupDetail.classList.add('group-info');

        const groupTitle = document.createElement('h2');
        groupTitle.innerHTML = group.name;

        const groupDescription = document.createElement('p');
        groupDescription.innerHTML = `${group.members.length} utilisateurs`;

        const projectMembersCount = getProjectMembersCount(group.name);

        if (projectMembersCount != group.members.length) {
            groupDescription.innerHTML += ` • ${projectMembersCount} sur ${group.members.length} ajoutés`;
        } else {
            groupDescription.innerHTML += ` • Tous ajoutés`;
        }

        const groupButton = document.createElement('button');
        
        groupButton.setAttribute('type', 'button');
        groupButton.setAttribute('for', group.name);

        groupButton.innerHTML = getUnselectedCount(group.name) ? 'Add' : 'Remove';

        groupDetail.append(groupTitle, groupDescription);

        groupElement.append(groupDetail, groupAvatars, groupButton);

        groupsList.append(groupElement);
    });
}

function getUnselectedCount(groupName) {
    const group = groups.find((g) => g.name === groupName);

    const currentUser = angular.element('body').scope().user;

    // Check some members are invited
    const unselected = group.members.filter((member) => {
        if (currentUser.email === member) {
            return;
        }
        
        return !getUserFromEmail(member).isSelectedForProject
     });

    return unselected.length;
}

function getProjectMembersCount(groupName) {
    const group = groups.find((g) => g.name === groupName);

    const currentUser = angular.element('body').scope().user;

    // Get every members of a project
    const members = group.members.filter((member) => {
        if (currentUser.email === member) {
            return true;
        }
        
        return getUserFromEmail(member).isProjectMember
     });

    return members.length;
}

function createUserTab() {
    const inviteModal = document.querySelector('[inv-modal]');

    const users = inviteModal.querySelector('.content');
    const searchBar = inviteModal.querySelector('.search');
    const tabsContainer = inviteModal.querySelector('.tabs');

    // Create a user tab
    const userTabContent = document.createElement('div');
    
    userTabContent.classList.add('users', 'tab-content', 'active');

    // Insert the user tab after the tabs container
    insertAfter(userTabContent, tabsContainer);

    // Move the search bar and the list of users into a container to swap between tabs
    userTabContent.append(searchBar);
    userTabContent.append(users);
}


function createTabsContainer() {
    const inviteModal = document.querySelector('[inv-modal]');
    const modalTitle = inviteModal.querySelector('h1');

    // Create a tab navigation
    const tabsContainer = document.createElement("ul");

    tabsContainer.classList.add('tabs');

    // Users tab
    const userTab = document.createElement('li');
    const userTabAction = document.createElement('a');

    userTabAction.setAttribute('for', 'users');
    userTabAction.classList.add('active');
    userTabAction.innerHTML = 'Utilisateurs';

    userTab.append(userTabAction);

    // Groups tab
    const groupsTab = document.createElement('li');
    const groupsTabAction = document.createElement('a');

    groupsTabAction.setAttribute('for', 'groups');
    groupsTabAction.innerHTML = 'Groupes';

    groupsTab.append(groupsTabAction);

    // Append user and groups tabs to the tabs container
    tabsContainer.append(userTab);
    tabsContainer.append(groupsTab);

    // Insert the tabs container into the modal (right before the search bar).
    insertAfter(tabsContainer, modalTitle);

    inviteModal.classList.add('is-processed');
}

function createTooltip(id) {
    const target = document.getElementById(id);


    if (!target) {
        return;
    }

    const title = target.getAttribute('title');

    target.setAttribute('data-title', title);
    target.removeAttribute('title');

    if (title.trim() == '') {
        return;
    }

    const tooltip = document.createElement('div');
    tooltip.classList.add('tooltip', 'fade', 'bottom', 'in');
    tooltip.setAttribute('for', id);

    const tooltipArrow = document.createElement('div');
    tooltipArrow.classList.add('tooltip-arrow');

    const tooltipInner = document.createElement('div');
    tooltipInner.classList.add('tooltip-inner');
    tooltipInner.innerText = title;

    tooltip.append(tooltipArrow, tooltipInner);

    tooltip.style.display = 'block';
    tooltip.style.position = 'fixed';

    document.body.append(tooltip);

    const tooltipRect = tooltip.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    
    tooltip.style.top = `${targetRect.top + targetRect.height}px`;
    tooltip.style.left = `${targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2)}px`;
}

function destroyTooltip(id) {
    const target = document.getElementById(id);

    const tooltip = document.querySelector(`.tooltip[for="${id}"]`);

    if (target.hasAttribute('data-title') && !target.hasAttribute('title')) {
        const title = target.getAttribute('data-title');

        target.setAttribute('title', title);
        target.removeAttribute('data-title');
    }

    tooltip.remove();
}

function addEventListeners() {
    const inviteModal = document.querySelector('[inv-modal]');

    const tabsContent = inviteModal.querySelectorAll('.tab-content');
    const tabs = inviteModal.querySelectorAll('.tabs li > a');

    // Event listeners
    tabs.forEach((tab) => {
        tab.addEventListener('click', (e) => { 
            if (e.currentTarget.classList.contains('active')) {
                return;
            }

            // Change the active tab
            tabs.forEach((t) => t.classList.remove('active'));
            tab.classList.add('active');

            // Display the tab content
            tabsContent.forEach((t) => {
                if (t.classList.contains(tab.getAttribute('for'))) {
                    t.classList.add('active');

                    return;
                }

                t.classList.remove('active');
            });


            // Users tab
            if (tab.classList.contains('users')) {
                inviteModal.querySelector('.tab-content.users').classList.add('active');
            } 
            
            // Groups tab
            if (tab.classList.contains('groups')) {
                inviteModal.querySelector('.tab-content.groups').classList.add('active');
            }
        })
    });

    const btns = inviteModal.querySelectorAll('.groups-list > li > button');

    btns.forEach((btn) => {
        btn.addEventListener('click', async (e) => { 
            const group = groups.find((g) => g.name === btn.getAttribute('for'));

            await invite(group.members, btn.innerHTML === 'Remove');

            btn.innerHTML = getUnselectedCount(group.name) ? 'Add' : 'Remove';
        });
    });

    const searchBar = inviteModal.querySelector('.tab-content.groups .search');

    searchBar.addEventListener('input', (e) => {
        // Show every groups
        inviteModal.querySelectorAll('.groups-list li').forEach((li) => { li.hidden = false });

        const value = e.target.value;

        const countElement = searchBar.querySelector('.count');

        // Filter groups to find groups that doesn't match the search
        const mismatchGroups = groups.filter((group) => {
            const matchesLabel = group.name.match(new RegExp(value, 'gi'));
            const matchesUser = group.members.some((member) => {
                const user = getUserFromEmail(member);

                return user.email.match(new RegExp(value, 'gi')) || user.name.match(new RegExp(value, 'gi'))
            })

            return !matchesLabel && !matchesUser;
        });

        countElement.hidden = !value?.length;
        countElement.innerHTML = `${groups.length - mismatchGroups.length}/${groups.length}`;

        mismatchGroups.forEach((group) => {
            inviteModal.querySelector(`.groups-list li:has(button[for="${group.name}"])`).hidden = true;
        })
    })

    // const usersList = inviteModal.querySelector('.user-list');

    // usersList.addEventListener('scroll', (e) => {
    //     addGroupNameToUsers();
    // })

    const avatars = inviteModal.querySelectorAll('.groups-list > li > .avatars > li');

    avatars.forEach((avatar) => {
        avatar.addEventListener('mouseenter', (e) => {
            const id = e.currentTarget.getAttribute('id');

            createTooltip(id);
        })

        avatar.addEventListener('mouseleave', (e) => {
            const id = e.currentTarget.getAttribute('id');

            destroyTooltip(id);
        })
    });
}

var observer = new MutationObserver(async function (mutations) {
    for (const { addedNodes } of mutations) {
        for (const node of addedNodes) {
            if (!node.tagName) continue; // not an element

            if (node.hasAttribute('inv-modal') && node.hasAttribute('id') && node.getAttribute('id') === 'project_members') {
                let alreadyDone = false;

                angular.element('[inv-modal]').scope().$watch(function(scope) {

                    if (scope.teamMembers?.length && !alreadyDone) {
                        alreadyDone = true;

                        // Create the tabs container
                        createTabsContainer();

                        // Create user tab
                        createUserTab();

                        // Move the save button
                        moveSaveBtn();

                        // Create group tab
                        createGroupsTab();
        
                        // Add search bar
                        createGroupsSearchBar();

                        const userListObserver = new MutationObserver(async function (mutations) {
                            for (const { addedNodes } of mutations) {
                                for (const node of addedNodes) {
                                    if (!node.tagName) continue; // not an element

                                    if (node.classList.contains('user-container')) {
                                        // Add group name to users
                                        addGroupNameToUsers();
                                    }
                                }
                            }
                        });

                        userListObserver.observe(document.querySelector('[inv-modal] .user-list'), {
                            childList: true,
                            subtree: true
                        });
        
                        // Add event listeners
                        addEventListeners();
                    } 
                });
            }
        }
    }
});

// Listen to every changes to detect invite modal open
observer.observe(document.body, {
    childList: true,
    subtree: true
});
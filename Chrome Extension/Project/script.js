// This script allows the InVision Share page to display groups of users.
// The groups are directly managed in the script with emails addressed
// Note : The script needs to be injected in the Invision page since we need to access Angular Scope to run genuine inviting actions from custom buttons.

// Groups list with a name and members emails
const groups = [
];

// Function to create an unique alpha-numerical id
function uuidv4() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}

// Insert after function since insertBefore is the only natively implemented JS insert function
function insertAfter(newNode, existingNode) {
    existingNode.parentNode.insertBefore(newNode, existingNode.nextSibling);
}


// Get a user profile from his mail through the Angular teamMembers scope
function getUserFromEmail(email) {
    // We use Angular public scope that contains every data of the page 
    const inviteModalScope = angular.element('[inv-modal]').scope();
    const currentUser = angular.element('body').scope().user;

    return currentUser.email === email ? currentUser : inviteModalScope.teamMembers.find((m) => m.email === email);
}

// Identify a user to be the project owner
function isProjectOwner(email) {
    return angular.element('.project').scope()?.projectOwner?.email === email
}

// Select users from emails to make them invited to the current project
async function invite(emails, reverse = false) {
    const inviteModalScope = angular.element('[inv-modal]').scope();
    const currentUser = angular.element('body').scope().user;

    // For each users check if it is a project member
    // In reverse mode we invite only the given emails and remove the rest
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

    // Apply Angular scope changes to reflect data changes on the page
    inviteModalScope.$apply();
}

// Add the group name information in the display of the genuine InVision user list
function addGroupNameToUsers() {
    const inviteModal = document.querySelector('[inv-modal]');
    const usersList = inviteModal.querySelector('.user-list');


    // Add the group name next to the user name
    const usersElements = usersList.querySelectorAll('.user-container:not(.processed)');

    usersElements.forEach((userElement) => {
        userElement.classList.add('processed');

        // Get email of the user from the DOM element to identify him in our groups
        const details = userElement.querySelector('.user-info p').innerText;
        const email = details.split('•').find((p) => p.includes('@')).trim();

        // Retrieve the user from the DOM email
        const user = getUserFromEmail(email);
        const group = groups.find((group) => group.members.includes(email));

        if (!user || !group) {
            return;
        }

        // Append the group name
        userElement.querySelector('h2').innerHTML = `${user.name} • ${group.name}`;
    });
}

// Move the save button after the tabs content to make it visible and usable for every tabs (group tab, user tab)
function moveSaveBtn() {
    const inviteModal = document.querySelector('[inv-modal]');
    const actions = inviteModal.querySelector('.actions');
    const usersTabContent = inviteModal.querySelector('.tab-content.users');
    
    // Insert the button after the tab contents
    insertAfter(actions, usersTabContent)
}

// Create a custom groups tab
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

    // Create each groups list item
    groups.forEach((group) => {
        const groupElement = document.createElement('li');

        // Create avatars list
        const groupAvatars = document.createElement('ul');
        groupAvatars.classList.add('avatars');

        const existingMembers = group.members


        const hasMore = existingMembers.length > 3;

        // Display the first 3 avatars only
        existingMembers.slice(0, 3).forEach((member, index) => {
            const user = getUserFromEmail(member);
            
            if (hasMore && index === 3) {
                return;
            }

            // Identify the user to be "me"
            const username = user ? (member === currentUser.email ? `${user.name} (moi)` : user.name) : member;

            // Display a check for already member users
            const statusIcon = isProjectOwner(member) ? '👑' : user?.isProjectMember || member === currentUser.email ? '✅' : '⛔️';
                
            const memberAvatar = document.createElement('li');
            memberAvatar.setAttribute('id', uuidv4());
            memberAvatar.setAttribute('title', `${statusIcon} ${username}`);

            if (!user?.hasSystemAvatar && user?.avatarUrl) {
                const memberImg = document.createElement('img');

                memberImg.setAttribute('src', user.avatarUrl);

                memberAvatar.append(memberImg);
            } else {
                const memberInitials = document.createElement('span');

                memberInitials.innerHTML = user?.initials || '?';
                memberInitials.classList.add('initials');

                memberAvatar.append(memberInitials)
            }
            
            if (user?.isProjectMember) {
                memberAvatar.classList.add('is-member');
            }

            groupAvatars.append(memberAvatar);
        })

        // If there is more than 3 avatars, display a "plus" avatar with a dropdown
        if (hasMore) {
            const otherMembers = existingMembers.slice(3, existingMembers.length);
            
            const moreAvatar = document.createElement('li');
            moreAvatar.classList.add('more');
            moreAvatar.innerHTML = `+${otherMembers.length}`;

            // Prepare tooltip/dropdown to display all users
            moreAvatar.setAttribute('id', uuidv4());
            moreAvatar.setAttribute('title', otherMembers.map((member) => {
                const user = getUserFromEmail(member);

                // Identify the user to be "me"
                const username = user ? (member === currentUser.email ? `${user.name} (moi)` : user.name) : member;

                // Display a check for already member users (a crown for the owner since he can't be in or out, he is the owner)
                const statusIcon = isProjectOwner(member) ? '👑' : user?.isProjectMember || member === currentUser.email ? '✅' : '⛔️';
                
                return (`${statusIcon} ${username}`);
            }).join('\n'));

            groupAvatars.append(moreAvatar);
        }

        // Fill the details of the group
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

// Create a custom search bar for the groups tab
function createGroupsSearchBar() {
    const inviteModal = document.querySelector('[inv-modal]');
    const groupsTabContent = inviteModal.querySelector('.tab-content.groups')

    // Create search container
    const search = document.createElement('div');
    search.classList.add('search');

    // Create search input element
    const searchInput = document.createElement('input');
    searchInput.setAttribute('type', 'text');
    searchInput.setAttribute('autocomplete', 'off');
    searchInput.setAttribute('placeholder', `Search ${groups.length} groups...`);

    // Create search filter count element (ex: 1 result on 4)
    const searchFilterCount = document.createElement('span');
    searchFilterCount.classList.add('count');

    searchFilterCount.hidden = true;
    searchFilterCount.innerHTML = `0/${groups.length}`;

    search.append(searchInput, searchFilterCount);

    groupsTabContent.prepend(search);
}


function getUnselectedCount(groupName) {
    const group = groups.find((g) => g.name === groupName);

    const currentUser = angular.element('body').scope().user;

    // Check some members are invited
    const unselected = group.members.filter((member) => {
        if (currentUser.email === member) {
            return;
        }
        
        return !getUserFromEmail(member)?.isSelectedForProject
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
        
        return getUserFromEmail(member)?.isProjectMember
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

// Create a tooltip from the title of the given element id
function createTooltip(id) {
    const target = document.getElementById(id);

    if (!target) {
        return;
    }

    const title = target.getAttribute('title');

    if (title?.trim() == '') {
        return;
    }

    target.setAttribute('data-title', title);
    target.removeAttribute('title');

    // Tooltip HTML structure
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

    if (!tooltip) {
        return;
    }

    if (target.hasAttribute('data-title') && !target.hasAttribute('title')) {
        const title = target.getAttribute('data-title');

        target.setAttribute('title', title);
        target.removeAttribute('data-title');
    }

    tooltip.remove();
}

// Manage every custom listeners on the page (tooltips, buttons clicks)
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

    // Create add / remove buttons for each groups
    const btns = inviteModal.querySelectorAll('.groups-list > li > button');

    btns.forEach((btn) => {
        btn.addEventListener('click', async (e) => { 
            const group = groups.find((g) => g.name === btn.getAttribute('for'));

            await invite(group.members, btn.innerHTML === 'Remove');

            btn.innerHTML = getUnselectedCount(group.name) ? 'Add' : 'Remove';
        });
    });

    // Manager custom search bar on the groups tab
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

    // Manage avatars tooltips
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

// Tricky part :
// We need to detect the opening of the [inv-modal] to append our custom elements (modal is inserted in the DOM on demand)
// As we move existing parts of Invision layout for the purpose of the plugin, since the modal is destroyed this needs to be done every opening.
var observer = new MutationObserver(async function (mutations) {
    for (const { addedNodes } of mutations) {
        for (const node of addedNodes) {
            if (!node.tagName) continue; // not an element

            if (node.hasAttribute('inv-modal') && node.hasAttribute('id') && node.getAttribute('id') === 'project_members') {
                let alreadyDone = false;

                // Listen the scope of angular to make sure that team members changed
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

                        // Another tricky part 
                        // We want to add group name to every Invision users 
                        // Since the list of the Invision users is dynamic and "virtualized" from Invision itself 
                        // We need to make sure that every scroll revealing a new user is properly processed so ... we listen to children changes
                        // Every time a new user is added we add him the corresponding group name (if it exists obviously) 
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

                        // Listen to the user list when subtree changed
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
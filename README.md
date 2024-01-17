**This repository is no longer maintained due to [InVision design collaboration services shutdown in December 2024](https://www.invisionapp.com/inside-design/invision-design-collaboration-services-shutdown/). I will keep this alive for educational purposes. If you have any question feel free to ask the in issues tab or add me on Discord: [@clement.moine](https://discordapp.com/users/1139534725107699793)**
=====

# 👨‍👧‍👧 Invision Assistant

Adds groups to InVision 

## Getting Started

The idea of this project is to permit groups among invite modale in InVision projects. 

I developped two methods to achieve this goal:
- Method #1: Chrome Extension
- Method #2: Bookmarklet

### Method #1: Chrome Extension

*InVision Assistant*, that's the name of the extension that simply allows you to add a "Group" tab in invite modale :

Users tab             |  Groups tab
:-------------------------:|:-------------------------:
![Screenshot of the classic users list of the InVision invite modale located under a "Users" tab.](./Chrome%20Extension/Screenshots/projects.invisionapp.com_d_main_%20(2).png)  |  ![Screenshot of the new "Groups" tab that contains custom groups of actual InVision users.](./Chrome%20Extension/Screenshots/projects.invisionapp.com_d_main_%20(3).png)

You can install the extension from Chrome Web Store or manually from unpacked package.

#### Chrome Web Store 

Install the extension from the Chrome Web Store : https://chrome.google.com/webstore/detail/invision-assistant/fdjkmplhnhnbdphemgggnlimjkfpnklm

#### Manual install

To install an extension that is not validated by Google Chrome Web Store, you need to manually import that extension directly from the files.

```
git clone https://github.com/clementmoine/invision-invite.git
```

1. Open your Chrome base browser (ex: Chrome, Brave, Arc ...). 
2. Go to that URL `chrome://extensions/`.
3. Enable the developer mode from the top right toggle switch
4. Click the `Load unpacked` button.
5. Browse and select the main folder of the extension, the file containing `manifest.json` file.

And ... voilà 🎉

The Chrome extension is now installed and you can manage the group list from the `script.js` file :

```
const groups = [
    {
        name: '👩🏻‍🎨 Hire me',
        members: [
            'clement.moine86@gmail.com'
        ]
    },
    {
        name: '📐 Ask me anything',
        members: [
        ]
    }
];
```

NOTE : Do not forget to click the update button from the Chrome Extensions page to handle your changes.


### Method #2 : Bookmarklet

The idea of this script is to permit multiple invites on InVision projects on a click. I use it every single day to share new projects to predefined list of people in my company. You simply can use it from the Chrome console by copying the content of `index.js`. In my case I prefer using it with a javascript bookmarklet in Chrome. 

<img width="390" alt="image" src="https://user-images.githubusercontent.com/27948112/234039129-90b30289-1d0c-4743-b611-3d9514b197e6.png">

_Below is an example of how you can install the script in your bookmarks to simply click on that and run the script. Feel free to use this script in the way that suits you best_

1. Go to a JS code minifying website (i.e: [javascriptcompressor.com](https://javascriptcompressor.com/))
2. Edit the mail list in `index.js`
   ```js
   invite(["this is where your email goes"]);
   ```
3. Copy the script code in the minifying website.
4. Create a new bookmark in your browser (working on every browser AFAIK) with `javascript:` right before the minifyied code
   ```js
   javascript:async function invite(users){const projectSco ...
   ```
5. Go to a new project and then you should see invites sending themselves from your click on the bookmarklet !

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE.txt` for more information.

<!-- CONTACT -->
## Contact

Clément MOINE - [@clementmoine_](https://twitter.com/clementmoine_) - clement.moine86@gmail.com

Project Link: [https://github.com/clementmoine/invision-invite](https://github.com/clementmoine/invision-invite)

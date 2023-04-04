## Getting Started

The idea of this script is to permit multiple invites on InVision projects on a click. I use it every single day to share new projects to predefined list of people in my company. You simply can use it from the Chrome console by copying the content of `index.js`. In my case I prefer using it with a javascript bookmarklet in Chrome. 

### Create a bookmarklet

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

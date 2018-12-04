const { default: fetch } = require("node-fetch");

const getQueryParams = require("../../utils/getQueryParams");
const makeSidebarSubredditLinks = require("../../utils/makeSidebarSubredditLinks");
const withHtmlShell = require("../../utils/withHtmlShell");
const icons = require("../../utils/subredditList");

// If this is 0, the lambda is cold. 😉
let invoked = 0;

module.exports = async (req, res) => {
  /**
   * Reset a mock on each invocation because we mutate it in case of a query param
   * and state is persisted while the function is warm.
   */
  let mock = require("../../utils/mock");

  // Calculate boot costs.
  console.time("Import vhtml" + invoked);
  const h = require("vhtml");
  console.timeEnd("Import vhtml" + invoked);

  // Fetch if we have the query param.
  const queryParams = getQueryParams(req);

  if (queryParams.fetch) {
    const rawMock = await fetch("https://reddit.com/r/" + queryParams.fetch + ".json");
    mock = await rawMock.json();
  }

  // Just put it.
  res.writeHead(200, { "content-type": "text/html" });
  res.end(
    withHtmlShell("vhtml")(
      h(
        "div",
        { class: "App" },
        h(
          "header",
          { class: "header" },
          h(
            "div",
            { class: "header__logo-container" },
            h("img", {
              class: "header__logo",
              alt: "Logo",
              src: "https://logos-download.com/wp-content/uploads/2016/06/Reddit_logo_full_1.png",
            }),
          ),
          h(
            "div",
            { class: "header__search-container" },
            h(
              "form",
              {
                action: "",
              },
              h("input", {
                name: "fetch",
                class: "header__search",
                placeholder: "Enter a Subreddit...",
              }),
            ),
          ),
          h(
            "div",
            { class: "header__user-area" },
            h(
              "div",
              null,
              h("div", { class: "header__username" }, "evilrabbit"),
              h(
                "div",
                { class: "header__karma-container" },
                h(
                  "svg",
                  {
                    class: "header__karma-thing",
                    viewBox: "0 0 11 10",
                    xmlns: "http://www.w3.org/2000/svg",
                  },
                  h("path", {
                    d:
                      "M2.36538 1.89791C3.50277 1.89791 4.51442 2.58139 4.94329 3.63791C4.97061 3.70561 4.97174 3.78104 4.94647 3.84953C4.9212 3.91801 4.87133 3.97463 4.80659 4.00835C4.53892 4.14655 4.32072 4.36439 4.18207 4.63183C4.14871 4.69691 4.09215 4.74712 4.02356 4.77253C3.95497 4.79793 3.87935 4.79669 3.81164 4.76904C3.2972 4.56264 2.85647 4.20673 2.54639 3.74728C2.23631 3.28783 2.07112 2.74595 2.07216 2.19165C2.07216 2.02991 2.20364 1.89791 2.36538 1.89791ZM6.15007 4.00835C6.08525 3.97472 6.03531 3.9181 6.01003 3.84959C5.98474 3.78108 5.98594 3.70559 6.01338 3.63791C6.2197 3.12338 6.57558 2.68254 7.03503 2.37236C7.49449 2.06218 8.03641 1.89691 8.59077 1.89791C8.75355 1.89791 8.88399 2.02887 8.88399 2.19165C8.88503 2.74595 8.71984 3.28783 8.40976 3.74728C8.09967 4.20673 7.65895 4.56264 7.14451 4.76904C7.07688 4.79698 7.00122 4.79842 6.93258 4.77309C6.86393 4.74776 6.80734 4.69751 6.77407 4.63235C6.63532 4.36504 6.41738 4.14711 6.15007 4.00835ZM7.14503 5.83965C7.65929 6.04625 8.09983 6.40223 8.40979 6.86165C8.71976 7.32107 8.88493 7.86284 8.88399 8.41704C8.88399 8.57878 8.75355 8.71078 8.59077 8.71078C8.03644 8.71164 7.49459 8.54632 7.03515 8.23616C6.57572 7.926 6.21981 7.48524 6.01338 6.97078C5.98618 6.90308 5.98511 6.82769 6.01037 6.75923C6.03563 6.69078 6.08542 6.63416 6.15007 6.60035C6.41763 6.46127 6.63573 6.24298 6.77459 5.97531C6.80822 5.9105 6.8649 5.86063 6.93346 5.83552C7.00202 5.81042 7.0775 5.81189 7.14503 5.83965ZM4.80659 6.59983C4.87146 6.63356 4.92141 6.69027 4.94669 6.75887C4.97197 6.82747 4.97076 6.90303 4.94329 6.97078C4.73676 7.48528 4.38076 7.92605 3.92124 8.23621C3.46172 8.54637 2.91978 8.71168 2.36538 8.71078C2.28747 8.71078 2.21276 8.67984 2.15767 8.62475C2.10259 8.56966 2.07164 8.49495 2.07164 8.41704C2.07164 7.27965 2.75512 6.26852 3.81164 5.83965C3.87927 5.8123 3.95466 5.81109 4.02313 5.83626C4.09161 5.86143 4.14826 5.91118 4.18207 5.97583C4.3219 6.24504 4.53738 6.46 4.80659 6.59983ZM5.47807 3.39113C5.23196 2.8052 4.82609 2.30025 4.30677 1.93391C4.47981 1.39652 4.84233 0.940359 5.32677 0.650436C5.37232 0.623123 5.42444 0.608696 5.47755 0.608696C5.53066 0.608696 5.58278 0.623123 5.62833 0.650436C6.11307 0.94004 6.47596 1.39602 6.64938 1.93339C6.12998 2.29987 5.7241 2.805 5.47807 3.39113ZM10.132 5.15304C10.1878 5.24591 10.1878 5.36174 10.132 5.45565C9.84199 5.94003 9.38586 6.30253 8.84851 6.47565C8.48214 5.95624 7.97722 5.5502 7.39129 5.30383C7.97744 5.05809 8.48261 4.65236 8.84903 4.13304C9.38642 4.30586 9.84248 4.66845 10.132 5.15304ZM5.47807 7.21704C5.72416 7.80343 6.13024 8.30876 6.6499 8.67531C6.47637 9.21248 6.11349 9.66826 5.62886 9.95774C5.58342 9.98539 5.53126 10 5.47807 10C5.42489 10 5.37273 9.98539 5.32729 9.95774C4.84285 9.66817 4.48016 9.2124 4.30677 8.67531C4.82624 8.30869 5.23213 7.80336 5.47807 7.21704ZM3.56486 5.30435C2.97873 5.55038 2.47359 5.95626 2.10712 6.47565C1.56991 6.3025 1.11396 5.94 0.82416 5.45565C0.796571 5.4102 0.781982 5.35804 0.781982 5.30487C0.781982 5.2517 0.796571 5.19954 0.82416 5.15409C1.11364 4.66945 1.56942 4.30657 2.10659 4.13304C2.47321 4.65252 2.97854 5.0584 3.56486 5.30435Z",
                  }),
                ),
                h("div", { class: "header__karma-counter" }, "1 karma"),
              ),
            ),
            h(
              "div",
              { class: "header__avatar-container" },
              h("img", {
                class: "header__avatar",
                alt: "Evil Rabbit",
                src: "https://pbs.twimg.com/profile_images/751015840464695296/atZxLCkV_400x400.jpg",
              }),
            ),
          ),
        ),
        h(
          "main",
          { class: "main" },
          h(
            "div",
            { class: "section" },
            h("h6", { class: "section__heading" }, "Reddit Feeds"),
            h(
              "ul",
              { class: "section__list" },
              h(
                "li",
                { class: "section__list-item" },
                h(
                  "svg",
                  {
                    class: `section__list-item-icon${!queryParams.fetch ? " active" : ""}`,
                    width: "18",
                    height: "16",
                    viewBox: "0 0 18 16",
                    fill: "none",
                    xmlns: "http://www.w3.org/2000/svg",
                  },
                  h("path", {
                    "fill-rule": "evenodd",
                    "clip-rule": "evenodd",
                    d:
                      "M6 5C6 3.346 7.346 2 9 2C10.654 2 12 3.346 12 5V7.843C11.489 8.013 10.53 8.235 9 8.235C7.465 8.235 6.505 8.012 6 7.844V5ZM14 6.895C16.409 7.355 18 8.136 18 9.026C18 10.444 13.97 11.594 9 11.594C4.03 11.594 0 10.444 0 9.026C0 8.136 1.59 7.355 4 6.895V5C4 2.243 6.243 0 9 0C11.757 0 14 2.243 14 5V6.895ZM1.74 11.599C3.892 12.343 6.867 12.594 9 12.594C11.133 12.594 14.108 12.344 16.26 11.599L13.305 13.719C12.0496 14.6181 10.5442 15.1015 9 15.1015C7.45585 15.1015 5.95044 14.6181 4.695 13.719L1.74 11.599Z",
                  }),
                ),
                h("a", { href: "?" }, "Home"),
              ),
              h(
                "li",
                { class: "section__list-item" },
                h(
                  "svg",
                  {
                    class: `section__list-item-icon`,
                    width: "20",
                    height: "13",
                    viewBox: "0 0 20 13",
                    fill: "none",
                    xmlns: "http://www.w3.org/2000/svg",
                  },
                  h("path", {
                    d: "M12.5 0.5H20V8L17.5 5.5L11.25 11.75L7.5 8L2.5 13L0 10.5L7.5 3L11.25 6.75L15 3L12.5 0.5Z",
                    fill: "black",
                  }),
                ),
                h("a", { href: "?fetch=popular" }, "Popular"),
              ),
              h(
                "li",
                { class: "section__list-item" },
                h(
                  "svg",
                  {
                    class: `section__list-item-icon`,
                    width: "18",
                    height: "18",
                    viewBox: "0 0 18 18",
                    fill: "none",
                    xmlns: "http://www.w3.org/2000/svg",
                  },
                  h("path", {
                    "fill-rule": "evenodd",
                    "clip-rule": "evenodd",
                    d:
                      "M0.25 17.5V7.5H5.25V17.5H0.25ZM11.5 17.5001H6.49995V5.0001H3.99995L8.99995 0.000595093L14 5.0001H11.5V17.5001ZM12.75 17.5V12.5H17.75V17.5H12.75Z",
                    fill: "black",
                  }),
                ),
                h("a", { href: "?fetch=all" }, "All"),
              ),
              h(
                "li",
                { class: "section__list-item" },
                h(
                  "svg",
                  {
                    class: `section__list-item-icon`,
                    width: "18",
                    height: "14",
                    viewBox: "0 0 18 14",
                    fill: "none",
                    xmlns: "http://www.w3.org/2000/svg",
                  },
                  h("path", {
                    d:
                      "M15.9998 -0.000488281C17.1028 -0.000488281 17.9998 0.897511 17.9998 1.99951V11.9995C17.9998 13.1025 17.1028 13.9995 15.9998 13.9995H1.9998C0.897802 13.9995 -0.000198364 13.1025 -0.000198364 11.9995V1.99951C-0.000198364 0.897511 0.897802 -0.000488281 1.9998 -0.000488281H15.9998ZM12.9648 10.3525C14.2718 10.3525 15.3188 9.67451 15.8278 8.56651L14.1818 7.97751C13.9318 8.47651 13.4528 8.81651 12.8338 8.81651C12.0158 8.81651 11.3478 8.05751 11.3478 6.99951C11.3478 5.95251 12.0058 5.17351 12.8438 5.17351C13.4528 5.17351 13.9218 5.50251 14.1308 5.96151L15.6968 5.24351C15.1988 4.27551 14.2108 3.63651 12.9648 3.63651C11.0588 3.63651 9.5118 5.13351 9.5118 6.99951C9.5118 8.87551 11.0588 10.3525 12.9648 10.3525ZM5.6248 10.3635C7.5408 10.3635 9.0878 8.87551 9.0878 6.99951C9.0878 5.13351 7.5408 3.63651 5.6248 3.63651C3.7188 3.63651 2.1718 5.13351 2.1718 6.99951C2.1718 8.87551 3.7188 10.3635 5.6248 10.3635ZM5.625 5.16411C6.562 5.16411 7.262 5.94211 7.262 7.00011C7.262 8.04811 6.562 8.83611 5.625 8.83611C4.697 8.83611 3.998 8.04811 3.998 7.00011C3.998 5.94211 4.697 5.16411 5.625 5.16411Z",
                    fill: "black",
                  }),
                ),
                h("a", { href: "?fetch=originalcontent" }, "Original Content"),
              ),
            ),
            h("h6", { class: "section__heading" }, "Favorites"),
            h("ul", { class: "section__list" }, icons.slice(0, 4).map(makeSidebarSubredditLinks(h, "vhtml"))),
            h("h6", { class: "section__heading" }, "Subscriptions"),
            h("ul", { class: "section__list" }, icons.map(makeSidebarSubredditLinks(h, "vhtml"))),
            h("h6", { class: "section__heading" }, "Other"),
            h(
              "ul",
              { class: "section__list" },
              h(
                "li",
                { class: "section__list-item" },
                h(
                  "svg",
                  {
                    class: `section__list-item-icon`,
                    viewBox: "0 0 20 20",
                    xmlns: "http://www.w3.org/2000/svg",
                  },
                  h(
                    "g",
                    { fill: "inherit" },
                    h("path", {
                      d:
                        "M7.03093403,10 C7.03093403,8.36301971 8.36301971,7.03093403 10,7.03093403 C11.6369803,7.03093403 12.9679409,8.36301971 12.9679409,10 C12.9679409,11.6369803 11.6369803,12.969066 10,12.969066 C8.36301971,12.969066 7.03093403,11.6369803 7.03093403,10 M16.4016617,8.49127796 C16.2362761,7.79148295 15.9606334,7.13669084 15.5916096,6.5437777 L16.5231696,5.06768276 C16.7526843,4.70315931 16.7684353,4.22387849 16.5231696,3.83572852 C16.1833977,3.29794393 15.4712269,3.13593351 14.9323172,3.47683044 L13.4562223,4.40839036 C12.8633092,4.03936662 12.208517,3.76259882 11.508722,3.59833825 L11.1250724,1.89947899 C11.0294412,1.47982699 10.7020452,1.12992949 10.2542664,1.02867298 C9.63322641,0.888038932 9.01556168,1.27843904 8.87492764,1.89947899 L8.49127796,3.59833825 C7.79148295,3.76259882 7.13669084,4.03936662 6.54265263,4.40726528 L5.06768276,3.47683044 C4.70315931,3.24731568 4.22387849,3.23156466 3.83572852,3.47683044 C3.29794393,3.81660229 3.13593351,4.5287731 3.47683044,5.06768276 L4.40726528,6.54265263 C4.03936662,7.13669084 3.76259882,7.79148295 3.59721318,8.49127796 L1.89947899,8.87492764 C1.47982699,8.97055879 1.12992949,9.29795485 1.02867298,9.74573365 C0.888038932,10.3667736 1.27843904,10.9844383 1.89947899,11.1250724 L3.59721318,11.508722 C3.76259882,12.208517 4.03936662,12.8633092 4.40726528,13.4573474 L3.47683044,14.9323172 C3.24731568,15.2968407 3.23156466,15.7761215 3.47683044,16.1642715 C3.81660229,16.7020561 4.5287731,16.8640665 5.06768276,16.5231696 L6.54265263,15.5927347 C7.13669084,15.9606334 7.79148295,16.2374012 8.49127796,16.4016617 L8.87492764,18.100521 C8.97055879,18.520173 9.29795485,18.8700705 9.74573365,18.971327 C10.3667736,19.1119611 10.9844383,18.721561 11.1250724,18.100521 L11.508722,16.4016617 C12.208517,16.2374012 12.8633092,15.9606334 13.4562223,15.5916096 L14.9323172,16.5231696 C15.2968407,16.7526843 15.7749964,16.7684353 16.1631464,16.5231696 C16.7020561,16.1833977 16.8629414,15.4712269 16.5231696,14.9323172 L15.5916096,13.4562223 C15.9606334,12.8633092 16.2362761,12.208517 16.4016617,11.508722 L18.100521,11.1250724 C18.520173,11.0294412 18.8700705,10.7020452 18.971327,10.2542664 C19.1119611,9.63322641 18.721561,9.01556168 18.100521,8.87492764 L16.4016617,8.49127796 Z",
                    }),
                  ),
                ),
                h("a", { href: "?fetch=myaccount" }, "My Account"),
              ),
              h(
                "li",
                { class: "section__list-item" },
                h(
                  "svg",
                  {
                    class: `section__list-item-icon`,
                    viewBox: "0 0 20 20",
                    xmlns: "http://www.w3.org/2000/svg",
                  },
                  h("path", {
                    d:
                      "M8.10849995,9.1565 L2.79999995,3.848 C3.17249995,3.6285 3.60499995,3.5 4.06849995,3.5 L16.5685,3.5 C17.0315,3.5 17.464,3.6285 17.8365,3.848 L12.528,9.1565 C11.31,10.375 9.32699995,10.375 8.10849995,9.1565 Z M13.1435,10.3085 L18.452,5 C18.6715,5.3725 18.8,5.805 18.8,6.2685 L18.8,13.7685 C18.8,15.149 17.6805,16.2685 16.3,16.2685 L3.79999995,16.2685 C2.41899995,16.2685 1.29999995,15.149 1.29999995,13.7685 L1.29999995,6.2685 C1.29999995,5.805 1.42849995,5.3725 1.64799995,5 L6.95649995,10.3085 C7.80949995,11.1615 8.92949995,11.588 10.05,11.588 C11.17,11.588 12.2905,11.1615 13.1435,10.3085 Z",
                  }),
                ),
                h("a", { href: "?fetch=messages" }, "Messages"),
              ),
            ),
          ),
          h("div", null),
          h(
            "div",
            { class: "feed" },
            (mock.data || { children: [] }).children.map(function(_ref) {
              var data = _ref.data;
              const hasThumbnail =
                Boolean(data.thumbnail) && ["self", "default", "", "nsfw"].indexOf(data.thumbnail) > -1;
              return h(
                "a",
                { key: data.url, class: "feed__feed-link feed-link", href: data.url, target: "_blank" },
                h(
                  "div",
                  { class: "feed__feed-item feed-item" },
                  h("div", { class: "feed-item__voting" }, data.ups - data.downs),
                  h(
                    "div",
                    {
                      class: "feed-item__image-container",
                      style: hasThumbnail ? `border: "1px solid #eaeaea"` : `background-image: url(${data.thumbnail})`,
                    },
                    hasThumbnail
                      ? h(
                          "svg",
                          {
                            width: "40",
                            height: "40",
                            viewBox: "0 0 40 40",
                            fill: "none",
                            xmlns: "http://www.w3.org/2000/svg",
                          },
                          h("path", {
                            d:
                              "M20 40C31.0457 40 40 31.0457 40 20C40 8.9543 31.0457 0 20 0C8.9543 0 0 8.9543 0 20C0 31.0457 8.9543 40 20 40Z",
                            fill: "#CCCCCC",
                          }),
                          h("path", {
                            d:
                              "M33.34 20C33.3194 19.437 33.1364 18.892 32.8131 18.4307C32.4898 17.9694 32.0399 17.6115 31.5177 17.4001C30.9956 17.1887 30.4234 17.1328 29.8702 17.2393C29.317 17.3457 28.8064 17.6099 28.4 18C26.1248 16.4534 23.4504 15.599 20.7 15.54L22 9.3L26.28 10.2C26.3309 10.673 26.5487 11.1123 26.8943 11.4392C27.2399 11.766 27.6907 11.959 28.1657 11.9834C28.6408 12.0079 29.109 11.8622 29.4864 11.5725C29.8637 11.2829 30.1254 10.8682 30.2246 10.4029C30.3237 9.9377 30.2538 9.45235 30.0274 9.03401C29.8009 8.61567 29.4328 8.29174 28.989 8.12037C28.5453 7.949 28.055 7.9414 27.6061 8.09895C27.1573 8.2565 26.7793 8.56887 26.54 8.98L21.64 8C21.5598 7.98242 21.477 7.98092 21.3963 7.99558C21.3156 8.01025 21.2386 8.04079 21.1697 8.08544C21.1009 8.13009 21.0416 8.18795 20.9953 8.25568C20.949 8.32341 20.9166 8.39965 20.9 8.48L19.42 15.42C16.6357 15.462 13.9245 16.317 11.62 17.88C11.3117 17.5899 10.944 17.3703 10.5423 17.2365C10.1407 17.1026 9.7148 17.0577 9.29409 17.1048C8.87338 17.1519 8.46795 17.2899 8.10589 17.5093C7.74382 17.7287 7.43379 18.0241 7.19727 18.3752C6.96075 18.7263 6.80341 19.1247 6.73614 19.5426C6.66887 19.9606 6.69328 20.3882 6.80769 20.7958C6.9221 21.2034 7.12376 21.5812 7.39871 21.9031C7.67365 22.225 8.0153 22.4833 8.39999 22.66C8.37747 22.9529 8.37747 23.2471 8.39999 23.54C8.39999 28.02 13.62 31.66 20.06 31.66C26.5 31.66 31.72 28.02 31.72 23.54C31.7425 23.2471 31.7425 22.9529 31.72 22.66C32.2135 22.4147 32.6276 22.0347 32.9142 21.564C33.2009 21.0933 33.3485 20.5511 33.34 20ZM13.34 22C13.34 21.6044 13.4573 21.2178 13.677 20.8889C13.8968 20.56 14.2092 20.3036 14.5746 20.1522C14.9401 20.0009 15.3422 19.9613 15.7302 20.0384C16.1181 20.1156 16.4745 20.3061 16.7542 20.5858C17.0339 20.8655 17.2244 21.2219 17.3016 21.6098C17.3787 21.9978 17.3391 22.3999 17.1877 22.7654C17.0364 23.1308 16.78 23.4432 16.4511 23.6629C16.1222 23.8827 15.7355 24 15.34 24C15.0773 24 14.8173 23.9483 14.5746 23.8478C14.332 23.7472 14.1115 23.5999 13.9258 23.4142C13.7401 23.2285 13.5927 23.008 13.4922 22.7654C13.3917 22.5227 13.34 22.2626 13.34 22ZM24.96 27.5C23.541 28.5693 21.7952 29.1136 20.02 29.04C18.2448 29.1136 16.4989 28.5693 15.08 27.5C14.9949 27.3964 14.9515 27.2648 14.9581 27.1309C14.9646 26.997 15.0208 26.8704 15.1156 26.7756C15.2104 26.6808 15.337 26.6246 15.4709 26.6181C15.6048 26.6115 15.7364 26.655 15.84 26.74C17.0424 27.622 18.5102 28.0666 20 28C21.4916 28.0811 22.9662 27.6507 24.18 26.78C24.2861 26.6766 24.4289 26.6195 24.5771 26.6214C24.6504 26.6223 24.7229 26.6377 24.7903 26.6666C24.8577 26.6955 24.9188 26.7375 24.97 26.79C25.0212 26.8425 25.0616 26.9046 25.0888 26.9728C25.116 27.0409 25.1295 27.1137 25.1286 27.1871C25.1277 27.2604 25.1123 27.3329 25.0834 27.4003C25.0544 27.4677 25.0125 27.5288 24.96 27.58V27.5ZM24.6 24.08C24.2044 24.08 23.8177 23.9627 23.4888 23.7429C23.1599 23.5232 22.9036 23.2108 22.7522 22.8454C22.6009 22.4799 22.5612 22.0778 22.6384 21.6898C22.7156 21.3019 22.9061 20.9455 23.1858 20.6658C23.4655 20.3861 23.8218 20.1956 24.2098 20.1184C24.5978 20.0413 24.9999 20.0809 25.3654 20.2322C25.7308 20.3836 26.0432 20.64 26.2629 20.9689C26.4827 21.2978 26.6 21.6844 26.6 22.08C26.6108 22.351 26.5665 22.6214 26.4696 22.8747C26.3727 23.128 26.2253 23.3589 26.0363 23.5535C25.8474 23.748 25.6209 23.9021 25.3705 24.0064C25.1201 24.1107 24.8512 24.1629 24.58 24.16L24.6 24.08Z",
                            fill: "white",
                          }),
                        )
                      : null,
                  ),
                  h(
                    "div",
                    { class: "feed-item__info" },
                    h(
                      "div",
                      { class: "feed-item__header" },
                      h("h2", { class: "feed-item__heading" }, data.title.slice(0, 60)),
                      h("span", { class: "feed_item__short-link" }, data.url.split("/")[2]),
                    ),
                    h(
                      "div",
                      { class: "feed-item__meta" },
                      "r/",
                      data.subreddit,
                      " \u2022 Posted by",
                      " ",
                      h("strong", null, "u/", data.author),
                    ),
                  ),
                  h(
                    "div",
                    { class: "feed-item__comments" },
                    h(
                      "svg",
                      {
                        class: "section__list-item-icon section__list-item-icon_compact",
                        width: "16",
                        height: "16",
                        viewBox: "0 0 16 16",
                        fill: "none",
                        xmlns: "http://www.w3.org/2000/svg",
                      },
                      h("path", {
                        "fill-rule": "evenodd",
                        "clip-rule": "evenodd",
                        d:
                          "M7.99963 13.9996C7.69365 13.9996 7.39291 13.9811 7.09617 13.9521L2.99986 16V12.4591C1.17245 11.1767 0 9.20932 0 7.00017C0 3.13384 3.58159 0 7.99963 0C12.4177 0 15.9993 3.13409 15.9993 7.00017C15.9993 10.8657 12.4177 13.9996 7.99963 13.9996Z",
                        fill: "#999999",
                      }),
                    ),
                    data.num_comments,
                  ),
                ),
              );
            }),
          ),
        ),
      ),
    ),
  );

  // This has been invoked.
  invoked++;
};

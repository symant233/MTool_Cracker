const { baidu } = require("../src/sdk");

baidu(
  "敵全体に対して、防御力無視の強力な攻撃を行う。\\r\\n通常よりも素早く行動できる。"
)
  .then((data) => {
    console.log(data);
  })
  .catch((e) => {
    console.error(e);
  });

const { Company, User, Shoe } = require('./db');

async function Main() {
  const companies = await Company.find({}, { projection: ['company_id', 'name'], limit: 1 });
  console.log(companies);

  const users = await User.find({}, { projection: ['name'], limit: 1 });
  console.log(users);

  await Shoe.insert({ marca: 'adidas', name: 'irforce' });
  await Shoe.insert({ marca: 'nike', name: 'watery' });
  await Shoe.insert({ marca: 'rebook', name: 'chapinz' });

  const shoes = await Shoe.find({}, { projection: ['name', 'id'], limit: 1 });
  console.log(shoes);
}

Main()
  .then(() => {
    console.log('\n\n> done');
    process.exit(0);
  })
  .catch(e => {
    console.log('\n\n> error\n', e);
    process.exit(1);
  });

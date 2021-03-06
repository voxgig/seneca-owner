require('seneca')
  .test()
  .use('promisify')
  .use('entity')
  .use('..', {
    fields: ['usr', 'org'],
    annotate: [
      'role:entity,cmd:save,base:zed',
      'role:entity,cmd:load,base:zed',
      'role:entity,cmd:list,base:zed',
      'role:entity,cmd:remove,base:zed',
    ],
  })
  .ready(async function () {
    // Set custom property to identify user

    var alice_instance = this.delegate(null, {
      custom: {
        'sys-owner': {
          usr: 'alice',
          org: 'wonderland',
        },
      },
    })

    var bob_instance = this.delegate(null, {
      custom: {
        'sys-owner': {
          usr: 'bob',
          org: 'wonderland',
        },
      },
    })

    // Save some entities

    var save_a1 = await alice_instance
      .entity('zed/foo')
      .data$({ id$: 1, a: 1 })
      .save$()
    var save_a2 = await bob_instance
      .entity('zed/foo')
      .data$({ id$: 2, a: 2 })
      .save$()

    // usr and org fields are injected from sys-owner custom property
    console.log(save_a1) // $-/zed/foo;id=1;{a:1,usr:alice,org:wonderland}
    console.log(save_a2) // $-/zed/foo;id=2;{a:2,usr:bob,org:wonderland}

    // Users can load their own data
    var load_a1 = await alice_instance.entity('zed/foo').load$(1)
    var load_a2 = await bob_instance.entity('zed/foo').load$(2)

    console.log(load_a1) // $-/zed/foo;id=1;{a:1,usr:alice,org:wonderland}
    console.log(load_a2) // $-/zed/foo;id=2;{a:2,usr:bob,org:wonderland}

    // Users can't load other user's data
    var not_a2 = await alice_instance.entity('zed/foo').load$(2)
    var not_a1 = await bob_instance.entity('zed/foo').load$(1)

    console.log(not_a2) // null
    console.log(not_a1) // null
  })

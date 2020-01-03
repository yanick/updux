import Updux from '.';

test('basic selectors', () => {
    const updux = new Updux({
        subduxes: {
            bogeys: {
                selectors: {
                    bogey: (bogeys: any) => (id: string) => bogeys[id],
                },
            },
        },
        selectors: {
            bogeys: ({ bogeys }: any) => bogeys,
        },
    } as any);

    const state = {
        bogeys: {
            foo: 1,
            bar: 2
        }
    };

    console.log(updux.selectors);

    expect( updux.selectors.bogeys(state) ).toEqual( { foo:1, bar :2 } );
    expect( (updux.selectors.bogey(state) as any)('foo')).toEqual(1);

});

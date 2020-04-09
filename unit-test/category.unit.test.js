const CategoryTest = require('../mock-classes/browse-mock')
CategoryTest.catgories = [{
        playlist: [],
        _id: "5e8668e200200555ec564a3d",
        name: "pop",
        images: []
    },
    {
        playlist: [],
        _id: "5e8668e200200555ec564a3d",
        name: "hip hop",
        images: []
    },
    {
        playlist: [],
        _id: "5e8668e200200555ec564a3d",
        name: "classic",
        images: []
    }
]
test('get categories', () => {
    expect(CategoryTest.getCategories()).toEqual([{
            playlist: [],
            _id: "5e8668e200200555ec564a3d",
            name: "pop",
            images: []
        },
        {
            playlist: [],
            _id: "5e8668e200200555ec564a3d",
            name: "hip hop",
            images: []
        },
        {
            playlist: [],
            _id: "5e8668e200200555ec564a3d",
            name: "classic",
            images: []
        }
    ]);
})

test('get category with id "5e8668e200200555ec564a3d"', () => {
    expect(CategoryTest.getCategoryById("5e8668e200200555ec564a3d")).toEqual({
            playlist: [],
            _id: "5e8668e200200555ec564a3d",
            name: "pop",
            images: []
        }

    )
})
import type { Locale } from "@/lib/i18n/dictionaries";

/**
 * Cardápios dos lugares (página /lugares/<id>), transcritos das fotos do
 * cardápio impresso que o Manu mandou. Itens tapados por adesivo no
 * cardápio ficaram de fora. Os nomes dos pratos não se traduzem (como os
 * nomes dos lugares); a descrição vem nos 3 idiomas.
 */

type T = Record<Locale, string>;

export interface MenuItem {
  name: string;
  /** Preço em reais. Com `prices`, o item tem mais de um tamanho. */
  price?: number;
  prices?: { label: T; value: number }[];
  desc?: T;
}

export interface MenuSection {
  id: string;
  title: T;
  /** Linha de apoio da categoria (ex.: sabores das caipirinhas). */
  note?: T;
  items: MenuItem[];
}

export interface Menu {
  /** Mês em que o cardápio foi fotografado, ex.: "2026-10". */
  checked: string;
  food: MenuSection[];
  drinks: MenuSection[];
}

const t = (pt: string, en: string, ar: string): T => ({ pt, en, ar });
const item = (name: string, price: number, desc?: T): MenuItem => ({ name, price, desc });

const BOTECO_SP: Menu = {
  checked: "2026-10",
  food: [
    {
      id: "saladas",
      title: t("Saladas", "Salads", "سلطات"),
      items: [
        item("Salada Caesar", 49.9, t("Alface americana, frango grelhado, parmesão, croutons e molho caesar.", "Iceberg lettuce, grilled chicken, parmesan, croutons and caesar dressing.", "خس، دجاج مشوي، بارميزان، خبز محمّص وصلصة سيزر.")),
        item("Salada verde", 44.9, t("Mix de folhas verdes, palmito em conserva, tomate e cebola roxa.", "Mixed greens, hearts of palm, tomato and red onion.", "تشكيلة أوراق خضراء، قلب النخيل، طماطم وبصل أحمر.")),
      ],
    },
    {
      id: "porcoes",
      title: t("Porções e petiscos", "Bar snacks & sharing plates", "مقبلات وأطباق للمشاركة"),
      items: [
        item("Batata Botequim", 63.9, t("Fritas crocantes cobertas com cupim desfiado e fonduta de queijos.", "Crispy fries topped with pulled beef hump and cheese fondue.", "بطاطا مقلية مقرمشة مع لحم مفتّت وفوندو الأجبان.")),
        item("Batata frita", 42.9, t("Porção de batata frita.", "French fries.", "بطاطا مقلية.")),
        item("Batata frita com bacon e cheddar", 54.9, t("Fritas com bacon e cheddar.", "Fries with bacon and cheddar.", "بطاطا مقلية مع لحم مقدد وشيدر.")),
        item("Polenta com parmesão", 42.9, t("Polenta frita com parmesão.", "Fried polenta with parmesan.", "بولينتا مقلية مع بارميزان.")),
        item("Frango à passarinho", 68.9, t("Frango frito em pedaços. Acompanha polenta e maionese da casa.", "Fried chicken bites, with polenta and house mayo.", "قطع دجاج مقلية، مع بولينتا ومايونيز المطعم.")),
        item("Isca de frango", 69.9, t("Tirinhas de frango empanadas. Acompanha molho da casa.", "Breaded chicken strips with house sauce.", "شرائح دجاج مقرمشة مع صلصة المطعم.")),
        item("Isca de peixe", 79.9, t("Tirinhas de peixe empanadas. Acompanha maionese verde.", "Breaded fish strips with green mayo.", "شرائح سمك مقرمشة مع مايونيز بالأعشاب.")),
        item("Torresmo de rolo Botequim", 78.9, t("Torresmo de barriga enrolada. Acompanha geleia de pimenta.", "Rolled crispy pork belly, with pepper jelly.", "بطن خنزير ملفوف مقرمش مع مربى الفلفل.")),
        {
          name: "Pastel",
          prices: [
            { label: t("10 unidades", "10 pieces", "١٠ قطع"), value: 68.9 },
            { label: t("5 unidades", "5 pieces", "٥ قطع"), value: 35.9 },
          ],
          desc: t("Carne, queijo e palmito com catupiry.", "Fried pastries: beef, cheese, and heart of palm with cream cheese.", "فطائر مقلية: لحم، جبن، وقلب النخيل مع جبنة كريمية."),
        },
        item("Provoleta", 46.9, t("Provolone grelhado na chapa, finalizado com chimichurri e tomatinhos assados.", "Grilled provolone with chimichurri and roasted cherry tomatoes.", "جبن بروفولوني مشوي مع تشيميتشوري وطماطم كرزية مشوية.")),
        item("Provolone à milanesa", 74.9, t("Cubos de provolone derretidos por dentro e crocantes por fora.", "Breaded provolone cubes, melty inside and crispy outside.", "مكعبات بروفولوني مقرمشة من الخارج وذائبة من الداخل.")),
        item("Bruschettas Botequim", 46.9, t("Pão italiano com tomatinhos confitados, muçarela derretida e pesto (4 unidades).", "Italian bread with confit cherry tomatoes, melted mozzarella and pesto (4 pieces).", "خبز إيطالي مع طماطم كرزية مطهوة، موزاريلا ذائبة وبيستو (٤ قطع).")),
        item("Canapés de carpaccio", 59.9, t("Canapés com parmesão ralado, molho mostarda com alcaparras e cebola roxa.", "Carpaccio canapés with grated parmesan, mustard-caper sauce and red onion.", "كانابيه كارباتشيو مع بارميزان، صلصة الخردل والكبر وبصل أحمر.")),
        item("Carpaccio", 57.9, t("Finas fatias de carne, cebola roxa, lascas de parmesão e molho de alcaparras. Acompanha torradas.", "Thin slices of beef, red onion, parmesan shavings and caper sauce, with toast.", "شرائح لحم رقيقة، بصل أحمر، رقائق بارميزان وصلصة الكبر، مع خبز محمّص.")),
        item("Porção de mini burger", 52.9, t("4 mini burgers angus com queijo cheddar. Acompanha maionese verde.", "4 angus mini burgers with cheddar and green mayo.", "٤ برغر صغيرة من لحم أنغوس مع شيدر ومايونيز بالأعشاب.")),
      ],
    },
    {
      id: "carnes-boteco",
      title: t("Carnes de boteco", "Pub-style meats", "لحوم على طريقة البار"),
      items: [
        item("Picanha aperitivo", 146.9, t("500 g de picanha temperada e grelhada. Acompanha pão, vinagrete e farofa.", "500 g seasoned grilled picanha (top sirloin cap), with bread, vinaigrette and farofa.", "٥٠٠ غ بيكانيا (غطاء الردف) متبلة ومشوية، مع خبز وصلصة الخل وفاروفا.")),
        item("Fraldinha ao molho Dijon", 155.9, t("Fraldinha grelhada ao molho mostarda Dijon, com pão, vinagrete e farofa.", "Grilled flank steak in Dijon mustard sauce, with bread, vinaigrette and farofa.", "شريحة لحم الخاصرة المشوية بصلصة خردل ديجون، مع خبز وصلصة الخل وفاروفا.")),
        item("Filé mignon gratinado com gorgonzola", 166.9, t("Acompanha pães.", "Beef tenderloin au gratin with gorgonzola, served with bread.", "فيليه بقري مغطى بجبن الغورغونزولا، مع الخبز.")),
        item("Filé mignon gratinado com catupiry e parmesão", 169.9, t("Acompanha pães.", "Beef tenderloin au gratin with cream cheese and parmesan, served with bread.", "فيليه بقري مغطى بجبنة كريمية وبارميزان، مع الخبز.")),
        item("Filé mignon acebolado", 141.9, t("Com cebola. Acompanha pães.", "Beef tenderloin with sautéed onions, served with bread.", "فيليه بقري مع بصل مشوّح، مع الخبز.")),
        item("Calabresa acebolada", 69.9, t("Linguiça calabresa com cebola. Acompanha mandioca frita, farofa, vinagrete e pão.", "Smoked sausage with onions, fried cassava, farofa, vinaigrette and bread.", "نقانق مدخنة مع بصل، مع كسافا مقلية وفاروفا وصلصة الخل وخبز.")),
        item("Bife da casa", 64.9, t("Molho à base de shoyu, limão e mel, com um toque de pimenta.", "House steak in a soy, lime and honey sauce with a hint of chili.", "شريحة لحم المطعم بصلصة الصويا والليمون والعسل مع لمسة فلفل.")),
      ],
    },
    {
      id: "individuais",
      title: t("Pratos individuais", "Individual dishes", "أطباق فردية"),
      items: [
        item("Ancho angus", 69.9, t("Servido com arroz branco e fritas.", "Angus ribeye with white rice and fries.", "ريب آي أنغوس مع أرز أبيض وبطاطا مقلية.")),
        item("Bife ancho grelhado", 59.9, t("Com risoto de parmesão.", "Grilled ribeye with parmesan risotto.", "ريب آي مشوي مع ريزوتو البارميزان.")),
      ],
    },
    {
      id: "compartilhar",
      title: t("Para compartilhar (2 a 3 pessoas)", "To share (2 to 3 people)", "للمشاركة (٢ إلى ٣ أشخاص)"),
      items: [
        item("Cupim casqueirado na telha", 189.9, t("Cupim assado por 4 horas no tempero da casa e casqueirado na churrasqueira. Acompanha arroz biro-biro, mandioca na manteiga, pão, vinagrete e farofa.", "Beef hump slow-roasted for 4 hours and crisped on the grill, with biro-biro rice, buttered cassava, bread, vinaigrette and farofa.", "لحم السنام مشوي ببطء ٤ ساعات ومحمّر على الشواية، مع أرز بيرو بيرو وكسافا بالزبدة وخبز وصلصة الخل وفاروفا.")),
        item("Filé mignon à parmegiana", 188.9, t("Acompanha arroz branco e batata frita.", "Breaded tenderloin parmigiana with white rice and fries.", "فيليه بارميجانا مع أرز أبيض وبطاطا مقلية.")),
        item("Bife ancho angus", 184.9, t("Com arroz biro-biro, batata rústica, vinagrete e farofa.", "Angus ribeye with biro-biro rice, rustic potatoes, vinaigrette and farofa.", "ريب آي أنغوس مع أرز بيرو بيرو وبطاطا ريفية وصلصة الخل وفاروفا.")),
        item("Bife ancho com crosta de alho e parmesão", 189.9, t("Bife ancho angus com arroz branco, fritas, vinagrete e farofa.", "Angus ribeye with a garlic-parmesan crust, white rice, fries, vinaigrette and farofa.", "ريب آي أنغوس بقشرة الثوم والبارميزان، مع أرز أبيض وبطاطا مقلية وصلصة الخل وفاروفا.")),
        item("Fraldinha angus red na brasa", 188.9, t("Acompanha arroz branco, batata frita, pão, vinagrete e farofa.", "Charcoal-grilled angus flank steak with white rice, fries, bread, vinaigrette and farofa.", "خاصرة أنغوس على الفحم مع أرز أبيض وبطاطا مقلية وخبز وصلصة الخل وفاروفا.")),
        item("Picanha na brasa", 215.9, t("Acompanha arroz biro-biro, batata rústica, pão, vinagrete e farofa.", "Charcoal-grilled picanha with biro-biro rice, rustic potatoes, bread, vinaigrette and farofa.", "بيكانيا على الفحم مع أرز بيرو بيرو وبطاطا ريفية وخبز وصلصة الخل وفاروفا.")),
        item("Picanha no aligot", 235.9, t("Picanha com purê aligot. Acompanha arroz biro-biro, batata rústica, vinagrete e farofa.", "Picanha with cheesy aligot mash, biro-biro rice, rustic potatoes, vinaigrette and farofa.", "بيكانيا مع بطاطا أليغو بالجبن وأرز بيرو بيرو وبطاطا ريفية وصلصة الخل وفاروفا.")),
        item("Picanha no réchaud", 169.9, t("Acompanha farofa, vinagrete e pão.", "Picanha served on a tabletop burner, with farofa, vinaigrette and bread.", "بيكانيا تُقدَّم على موقد صغير، مع فاروفا وصلصة الخل وخبز.")),
        item("Picanha de sol no réchaud", 179.9, t("Acompanha mandioca frita, manteiga de garrafa, pão, vinagrete e cebola.", "Sun-dried picanha on a tabletop burner, with fried cassava, clarified butter, bread, vinaigrette and onion.", "بيكانيا مجففة تُقدَّم على موقد صغير، مع كسافا مقلية وسمن وخبز وصلصة الخل وبصل.")),
        item("Tábua mista de carnes", 194.9, t("Picanha, linguiça toscana, tulipa de frango e queijo coalho. Acompanha pão de alho, arroz branco, vinagrete e farofa.", "Picanha, Tuscan sausage, chicken wings and grilled cheese, with garlic bread, white rice, vinaigrette and farofa.", "بيكانيا ونقانق توسكانية وأجنحة دجاج وجبن مشوي، مع خبز بالثوم وأرز أبيض وصلصة الخل وفاروفا.")),
        item("Joelho de porco defumado e frito", 198.9, t("Acompanha mandioca cozida e chucrute.", "Smoked and fried pork knuckle with boiled cassava and sauerkraut.", "ركبة خنزير مدخنة ومقلية مع كسافا مسلوقة وملفوف مخلل.")),
      ],
    },
    {
      id: "lanches",
      title: t("Burgers e lanches", "Burgers & sandwiches", "برغر وسندويشات"),
      items: [
        item("Lanche Botequim", 59.9, t("Filé mignon, muçarela, maionese da casa, cebola roxa, rúcula, bacon e azeitonas na baguete. Acompanha fritas.", "Tenderloin, mozzarella, house mayo, red onion, arugula, bacon and olives on a baguette, with fries.", "فيليه وموزاريلا ومايونيز المطعم وبصل أحمر وجرجير ولحم مقدد وزيتون في باغيت، مع بطاطا مقلية.")),
        item("Lanche de cupim", 54.9, t("Lascas de cupim casqueirado, muçarela derretida, rúcula, cebola roxa e maionese da casa na baguete. Acompanha fritas.", "Crispy beef hump, melted mozzarella, arugula, red onion and house mayo on a baguette, with fries.", "لحم السنام المحمّر وموزاريلا ذائبة وجرجير وبصل أحمر ومايونيز المطعم في باغيت، مع بطاطا مقلية.")),
        item("Burger cheddar e bacon", 44.9, t("Burger angus de 160 g, cheddar derretido, bacon e maionese da casa no pão brioche. Acompanha fritas.", "160 g angus burger, melted cheddar, bacon and house mayo on brioche, with fries.", "برغر أنغوس ١٦٠ غ مع شيدر ذائب ولحم مقدد ومايونيز المطعم في خبز بريوش، مع بطاطا مقلية.")),
        item("Burger salad Botequim", 44.9, t("Burger angus de 160 g, cheddar derretido, alface, tomate, cebola roxa e maionese da casa no pão brioche. Acompanha fritas.", "160 g angus burger, melted cheddar, lettuce, tomato, red onion and house mayo on brioche, with fries.", "برغر أنغوس ١٦٠ غ مع شيدر ذائب وخس وطماطم وبصل أحمر ومايونيز المطعم في خبز بريوش، مع بطاطا مقلية.")),
      ],
    },
    {
      id: "sobremesas",
      title: t("Sobremesas", "Desserts", "حلويات"),
      items: [
        item("Pudim Botequim", 23.9, t("Pudim de leite da casa.", "House caramel flan.", "كريم كراميل المطعم.")),
        item("Petit gâteau de chocolate", 32.9, t("Chocolate ao leite com cacau, sorvete de creme e morango.", "Milk chocolate lava cake with vanilla ice cream and strawberry.", "كعكة الشوكولاتة الذائبة مع آيس كريم الفانيليا والفراولة.")),
        item("Brownie com sorvete", 34.9, t("Chocolate 50% cacau, nozes, sorvete de creme e chocolate, com ganache quentinha.", "50% cocoa brownie with walnuts, vanilla and chocolate ice cream and warm ganache.", "براوني ٥٠٪ كاكاو مع جوز وآيس كريم فانيليا وشوكولاتة وغاناش دافئ.")),
        item("Creme de papaya", 29.9, t("Creme de mamão papaya finalizado com licor de cassis.", "Papaya cream topped with cassis liqueur.", "كريمة البابايا مع ليكيور الكشمش الأسود.")),
        item("Sundae", 24.9, t("Sorvetes de morango, chocolate e creme, com calda de frutas vermelhas ou ganache de chocolate e farofa de Ovomaltine.", "Strawberry, chocolate and vanilla ice cream with berry sauce or chocolate ganache and Ovomaltine crumble.", "آيس كريم فراولة وشوكولاتة وفانيليا مع صلصة التوت أو غاناش الشوكولاتة وفتات أوفومالتين.")),
      ],
    },
  ],
  drinks: [
    {
      id: "caipirinhas",
      title: t("Caipirinhas", "Caipirinhas", "كايبيرينيا"),
      note: t(
        "Sabores: kiwi com frutas vermelhas, pitaya com abacaxi, manga com maracujá, tangerina com maracujá, banana com limão e canela, melancia com maracujá, morango com framboesa e amora, limão com rapadura, três limões, lima-da-pérsia, tangerina com pimenta rosa, tangerina com gengibre, caju com geleia de pimenta, abacaxi com framboesa, uva com maracujá e hortelã, abacaxi com gengibre e tangerina com limão. O preço muda com a bebida escolhida:",
        "Flavors: kiwi & berries, pitaya & pineapple, mango & passion fruit, tangerine & passion fruit, banana, lime & cinnamon, watermelon & passion fruit, strawberry, raspberry & blackberry, lime & raw cane sugar, three limes, Persian lime, tangerine & pink pepper, tangerine & ginger, cashew fruit & pepper jelly, pineapple & raspberry, grape, passion fruit & mint, pineapple & ginger, and tangerine & lime. Price depends on the spirit:",
        "النكهات: كيوي مع التوت، بيتايا مع أناناس، مانجو مع باشن فروت، يوسفي مع باشن فروت، موز وليمون وقرفة، بطيخ مع باشن فروت، فراولة وتوت، ليمون مع سكر القصب، ثلاثة أنواع ليمون، ليمون فارسي، يوسفي مع فلفل وردي، يوسفي مع زنجبيل، كاجو مع مربى الفلفل، أناناس مع توت العليق، عنب وباشن فروت ونعناع، أناناس مع زنجبيل، ويوسفي مع ليمون. السعر حسب المشروب:",
      ),
      items: [
        item("Aguardente", 30.9),
        item("Cachaça especial", 35.9, t("Seleta ou Salinas.", "Seleta or Salinas cachaça.", "كاشاسا سيليتا أو ساليناس.")),
        item("Cachaça Espírito de Minas", 38.9),
        item("Saquê", 32.9, t("Saquê.", "Sake.", "ساكي.")),
        item("Vodka exclusiva Botequim", 31.9),
        item("Vodka Smirnoff", 34.9),
        item("Vodka Absolut", 39.9),
        item("Caipirinha dupla", 53.9, t("Duas caipirinhas.", "Two caipirinhas.", "كأسان من الكايبيرينيا.")),
        item("Maracujack", 46.9, t("Jack Daniel's, maracujá e um toque de pimenta tabasco.", "Jack Daniel's, passion fruit and a dash of Tabasco.", "جاك دانيلز وباشن فروت ولمسة تاباسكو.")),
        item("Caipirinha de Malibu", 35.9, t("Malibu, abacaxi, maracujá e hortelã.", "Malibu, pineapple, passion fruit and mint.", "ماليبو وأناناس وباشن فروت ونعناع.")),
        item("Caipirinha Ballena", 48.9, t("Ballena, frutas vermelhas e limão siciliano.", "Ballena, berries and lemon.", "باينا وتوت وليمون حامض.")),
      ],
    },
    {
      id: "gins",
      title: t("Gins", "Gin & tonics", "جن"),
      note: t(
        "Sabores: strawberry, frutas vermelhas, pitaya, limão siciliano, citrus, tropical, melancia, maçã do amor e tangerina com limão e Licor 43. Escolha o gin:",
        "Flavors: strawberry, berries, pitaya, lemon, citrus, tropical, watermelon, candy apple, and tangerine with lime and Licor 43. Pick your gin:",
        "النكهات: فراولة، توت، بيتايا، ليمون حامض، حمضيات، استوائي، بطيخ، تفاح بالكراميل، ويوسفي مع ليمون وليكيور 43. اختر الجن:",
      ),
      items: [
        item("Gin nacional", 34.9),
        item("Gin Tanqueray", 41.9),
        item("Gin nacional com Monster ou Red Bull", 41.9, t("Monster mango loco, melancia, tradicional ou tropical.", "With Monster (mango loco, watermelon, original or tropical) or Red Bull.", "مع مونستر (مانجو لوكو، بطيخ، كلاسيكي أو استوائي) أو ريد بول.")),
        item("Gin Tanqueray com Monster ou Red Bull", 49.9, t("Monster mango loco, melancia, tradicional ou tropical.", "With Monster (mango loco, watermelon, original or tropical) or Red Bull.", "مع مونستر (مانجو لوكو، بطيخ، كلاسيكي أو استوائي) أو ريد بول.")),
        item("Gin com toque de Licor 43", 54.9),
      ],
    },
    {
      id: "drinks",
      title: t("Drinks", "Cocktails", "كوكتيلات"),
      items: [
        item("Banho Botequim", 45.9, t("Rum branco, rum de coco, água de coco, leite de coco, leite condensado, um toque de amarula e chantilly.", "White rum, coconut rum, coconut water, coconut milk, condensed milk, a touch of Amarula and whipped cream.", "رم أبيض ورم جوز الهند وماء وحليب جوز الهند وحليب مكثف ولمسة أمارولا وكريمة مخفوقة.")),
        item("Coronita", 47.9, t("Tequila prata, limão, licor de laranja, sal e Coronita.", "Silver tequila, lime, orange liqueur, salt and a Coronita.", "تيكيلا فضية وليمون وليكيور البرتقال وملح وكورونيتا.")),
        item("Moscow mule", 38.9, t("Gengibre, limão, vodka e espuma de gengibre.", "Ginger, lime, vodka and ginger foam.", "زنجبيل وليمون وفودكا ورغوة الزنجبيل.")),
        item("Bloody Mary", 35.9, t("Suco de tomate, vodka, molho inglês e pimenta.", "Tomato juice, vodka, Worcestershire sauce and pepper.", "عصير طماطم وفودكا وصلصة ورسيسترشاير وفلفل.")),
        item("Cosmopolitan", 36.9, t("Vodka, Cointreau, limão e cranberry.", "Vodka, Cointreau, lime and cranberry.", "فودكا وكوانترو وليمون وتوت بري.")),
        item("Dry martini", 33.9, t("Gin, vermute seco e azeitona.", "Gin, dry vermouth and olive.", "جن وفيرموث جاف وزيتونة.")),
        item("Mojito", 35.9, t("Rum, hortelã, limão e soda.", "Rum, mint, lime and soda.", "رم ونعناع وليمون وصودا.")),
        item("Alexander", 32.9, t("Conhaque, licor de cacau, creme de leite e canela.", "Brandy, cacao liqueur, cream and cinnamon.", "براندي وليكيور الكاكاو وكريمة وقرفة.")),
        item("Lagoa azul", 32.9, t("Vodka, limão, curaçau blue e soda limonada.", "Vodka, lime, blue curaçao and lemon soda.", "فودكا وليمون وبلو كوراساو وصودا الليمون.")),
        item("Piña colada", 34.9, t("Rum prata, leite de coco, leite condensado e abacaxi.", "Silver rum, coconut milk, condensed milk and pineapple.", "رم فضي وحليب جوز الهند وحليب مكثف وأناناس.")),
        item("Cuba libre", 34.9, t("Rum Bacardi, limão e Coca-Cola.", "Bacardi rum, lime and Coca-Cola.", "رم باكاردي وليمون وكوكاكولا.")),
        item("Sex on the beach", 34.9, t("Vodka, licor de pêssego, suco de laranja e xarope de groselha.", "Vodka, peach liqueur, orange juice and grenadine.", "فودكا وليكيور الخوخ وعصير برتقال وشراب الرمان.")),
        item("Margarita", 36.9, t("Tequila prata, Cointreau, limão e sal na borda do copo.", "Silver tequila, Cointreau, lime and a salted rim.", "تيكيلا فضية وكوانترو وليمون وحافة مملحة.")),
        item("Espanhola", 34.9, t("Abacaxi, leite condensado e vinho tinto.", "Pineapple, condensed milk and red wine.", "أناناس وحليب مكثف ونبيذ أحمر.")),
        item("Whiskey sour", 38.9, t("Whisky, limão e açúcar.", "Whisky, lemon and sugar.", "ويسكي وليمون وسكر.")),
        item("Aperol spritz", 38.9, t("Aperol, prosecco, água com gás e laranja.", "Aperol, prosecco, sparkling water and orange.", "أبيرول وبروسيكو ومياه غازية وبرتقال.")),
        item("Negroni", 43.9, t("Campari, vermute rosso e gin.", "Campari, sweet vermouth and gin.", "كامباري وفيرموث أحمر وجن.")),
        item("Negroni café", 46.9, t("Campari, gin, vermute rosso e café espresso.", "Campari, gin, sweet vermouth and espresso.", "كامباري وجن وفيرموث أحمر وإسبريسو.")),
        item("Boulevardier", 46.9, t("Campari, vermute e Jack Daniel's.", "Campari, vermouth and Jack Daniel's.", "كامباري وفيرموث وجاك دانيلز.")),
        item("Carajillo", 42.9, t("Licor 43 e café espresso.", "Licor 43 and espresso.", "ليكيور 43 وإسبريسو.")),
        item("Fitzgerald", 39.9, t("Gin Tanqueray, limão siciliano, angostura e xarope simples.", "Tanqueray gin, lemon, Angostura bitters and simple syrup.", "جن تانكري وليمون حامض وأنغوستورا وشراب السكر.")),
        item("Clericot (1,5 litro)", 124.9, t("Espumante, frutas, gin, soda, licor de laranja e licor de pêssego.", "1.5 L: sparkling wine, fruit, gin, soda, orange liqueur and peach liqueur.", "١٫٥ لتر: نبيذ فوار وفواكه وجن وصودا وليكيور البرتقال وليكيور الخوخ.")),
        item("Sangria (1,5 litro)", 119.9, t("Vinho tinto, frutas, gin, soda, licor de laranja e licor de pêssego.", "1.5 L: red wine, fruit, gin, soda, orange liqueur and peach liqueur.", "١٫٥ لتر: نبيذ أحمر وفواكه وجن وصودا وليكيور البرتقال وليكيور الخوخ.")),
      ],
    },
    {
      id: "chopp",
      title: t("Chopp e cervejas", "Draft & bottled beer", "بيرة"),
      items: [
        {
          name: "Chopp Brahma",
          prices: [
            { label: t("300 ml", "300 ml", "٣٠٠ مل"), value: 13.5 },
            { label: t("650 ml", "650 ml", "٦٥٠ مل"), value: 21.9 },
          ],
        },
        {
          name: "Chopp Heineken",
          prices: [
            { label: t("300 ml", "300 ml", "٣٠٠ مل"), value: 13.9 },
            { label: t("650 ml", "650 ml", "٦٥٠ مل"), value: 22.9 },
          ],
        },
        item("Heineken 600 ml", 21.9, t("Garrafa.", "Bottle.", "زجاجة.")),
        item("Original 600 ml", 20.9, t("Garrafa.", "Bottle.", "زجاجة.")),
        item("Heineken long neck", 16.9),
        item("Heineken 0,0% long neck", 16.9, t("Sem álcool.", "Alcohol-free.", "بدون كحول.")),
        item("Sol long neck", 16.9),
        item("Sol Zero long neck", 16.9, t("Sem álcool.", "Alcohol-free.", "بدون كحول.")),
        item("Stella Artois long neck", 16.9),
        item("Cerpa long neck", 17.9),
        item("Lagunitas 355 ml", 19.9),
      ],
    },
    {
      id: "doses",
      title: t("Doses", "Shots & spirits", "جرعات"),
      items: [
        item("Cachaça Seleta", 19.9),
        item("Cachaça Salinas", 19.9),
        item("Cachaça Espírito de Minas", 25.9),
        item("Vodka Smirnoff", 22.9),
        item("Vodka Absolut", 28.9),
        item("Red Label", 34.9),
        item("Black Label", 39.9),
        item("Jack Daniel's", 36.9),
        item("Buchanan's", 41.9),
        item("Gin Tanqueray", 33.9),
        item("Tequila José Cuervo ouro", 30.9),
        item("Tequila José Cuervo prata", 30.9),
        item("Campari", 25.9),
        item("Carpano", 32.9),
        item("Cointreau", 29.9),
        item("Licor 43", 36.9),
        item("Jägermeister", 30.9),
        item("Ballena", 32.9),
        item("Steinhäger Schlichte", 32.9),
        item("Conhaque Domecq", 24.9),
        item("Martini", 23.9),
      ],
    },
    {
      id: "garrafas",
      title: t("Garrafas", "Bottles", "زجاجات"),
      items: [
        item("Red Label", 270),
        item("Black Label", 370),
        item("Gold Label", 540),
        item("Blue Label", 1690),
        item("Jack Daniel's", 330),
        item("Chivas", 345),
        item("Buchanan's", 420),
        item("Smirnoff", 220),
        item("Absolut", 320),
        item("Tanqueray", 340),
        item("Tequila José Cuervo ouro", 295),
        item("Tequila José Cuervo prata", 295),
        item("Campari", 260),
        item("Licor 43", 360),
        item("Jägermeister", 280),
        item("Ballena", 340),
      ],
    },
    {
      id: "sem-alcool",
      title: t("Sem álcool", "Non-alcoholic", "مشروبات بدون كحول"),
      items: [
        item("Limonade de morango com pimenta rosa", 18.9, t("Limão, morango e pimenta rosa.", "Strawberry lemonade with pink pepper.", "ليموناضة الفراولة مع الفلفل الوردي.")),
        item("Sucos naturais", 14.9, t("Laranja, abacaxi, abacaxi com hortelã, limão, morango e maracujá.", "Fresh juices: orange, pineapple, pineapple & mint, lime, strawberry and passion fruit.", "عصائر طازجة: برتقال، أناناس، أناناس بالنعناع، ليمون، فراولة وباشن فروت.")),
        item("Sucos especiais", 19.9, t("Monte o seu com até 2 frutas.", "Build your own with up to 2 fruits.", "اختر حتى فاكهتين.")),
        item("Soda italiana", 19.9, t("Maçã verde ou frutas vermelhas.", "Italian soda: green apple or berries.", "صودا إيطالية: تفاح أخضر أو توت.")),
        item("Refrigerantes", 9.9, t("Coca-Cola, Coca-Cola Zero, Fanta laranja, Fanta guaraná e Sprite.", "Soft drinks: Coca-Cola, Coke Zero, Fanta orange, Fanta guaraná and Sprite.", "مشروبات غازية: كوكاكولا، كوكاكولا زيرو، فانتا برتقال، فانتا غوارانا وسبرايت.")),
        item("Schweppes", 10.9, t("Tônica ou citrus.", "Tonic or citrus.", "تونيك أو حمضيات.")),
        item("Água", 7.9, t("Com ou sem gás.", "Still or sparkling water.", "ماء عادي أو فوار.")),
        item("Água de coco", 12.9, t("Água de coco.", "Coconut water.", "ماء جوز الهند.")),
        item("Monster", 16.9, t("Tradicional, mango loco ou melancia.", "Original, mango loco or watermelon.", "كلاسيكي، مانجو لوكو أو بطيخ.")),
        item("Red Bull", 21.9),
        item("Café espresso", 9.9, t("Café espresso.", "Espresso.", "إسبريسو.")),
      ],
    },
  ],
};

export const MENUS: Record<string, Menu> = {
  "boteco-sp": BOTECO_SP,
};

export function getMenu(placeId: string): Menu | undefined {
  return MENUS[placeId];
}

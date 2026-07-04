import { FashionStyle } from "../types";

export const FASHION_STYLES: FashionStyle[] = [
  {
    id: 's1',
    name: 'Thượng lưu',
    icon: 'fa-crown',
    bannerImage: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=1000',
    description: 'Phong cách Quiet Luxury - Sự sang trọng không cần phô trương. Tập trung vào chất liệu cao cấp và sự tinh tế trong cắt may.',
    knowledge: 'Quiet Luxury không chỉ là một xu hướng, mà là đạo lối sống của những người trân trọng giá trị cốt lõi hơn là vẻ ngoài hào nhoáng. Nó bắt nguồn từ nhu cầu về sự bền vững và vẻ đẹp vượt thời gian.',
    characteristics: [
      'Chất liệu thượng hạng (Cashmere, Silk, Linen tự nhiên)',
      'Bảng màu trung tính (Beige, Kem, Ghi, Navy)',
      'Phom dáng tối giản nhưng chuẩn xác từng milimet',
      'Không có logo hoặc logo rất kín đáo'
    ],
    characteristicItems: [
      'Áo khoác Blazer may đo',
      'Đầm lụa (Slip dress)',
      'Quần Tây ống rộng',
      'Giày Loafers da thật'
    ],
    representativeOutfit: {
      name: 'The Modern Heir',
      description: 'Sự kết hợp hoàn hảo giữa áo lụa bóng và quần tây cashmere màu kem.',
      image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=600'
    },
    gallery: [
      'https://images.unsplash.com/photo-1485231183945-fffde7cc051e?auto=format&fit=crop&q=80&w=400',
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=400',
      'https://images.unsplash.com/photo-1537832816519-689ad163238b?auto=format&fit=crop&q=80&w=400'
    ],
    stylingTips: [
      'Hãy chú ý đến phụ kiện: Một chiếc đồng hồ tinh xảo đáng giá hơn mười chiếc vòng rẻ tiền.',
      'Sự vừa vặn là tất cả. Nếu đồ không vừa, hãy mang tới thợ may.',
      'Sử dụng các layers với tông màu cùng sắc độ (Tone-sur-tone).'
    ],
    accessories: [
      'Khăn lụa Hermes',
      'Đồng hồ cơ cổ điển',
      'Túi xách da cấu trúc đứng',
      'Kính mắt gọng đơn giản'
    ]
  },
  {
    id: 's2',
    name: 'Tối giản',
    icon: 'fa-leaf',
    bannerImage: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&q=80&w=1000',
    description: 'Minimalism - "Less is more". Tập trung vào sự gọn gàng, tính đa dụng và sự cân bằng trong trang phục.',
    knowledge: 'Chủ nghĩa tối giản trong thời trang xuất hiện từ những năm 1920 (Coco Chanel) và bùng nổ vào những năm 1990. Nó hướng tới việc giải phóng con người khỏi sự rườm rà.',
    characteristics: [
      'Ít chi tiết thừa',
      'Bố cục hình học sạch sẽ',
      'Tập trung vào tính ứng dụng',
      'Bảng màu đơn sắc (Monochrome)'
    ],
    characteristicItems: [
      'Áo thun trắng Basic cao cấp',
      'Quần Jeans dáng đứng',
      'Áo sơ mi trắng Poplin',
      'Giày Sneakers trắng'
    ],
    representativeOutfit: {
      name: 'Essential White',
      description: 'Sơ mi trắng kết hợp cùng quần suông xám nhạt cho ngày làm việc năng động.',
      image: 'https://images.unsplash.com/photo-1495385794356-15371f348c31?auto=format&fit=crop&q=80&w=600'
    },
    gallery: [
      'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=400',
      'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=400',
      'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&q=80&w=400'
    ],
    stylingTips: [
      'Chọn mua những món đồ đắt tiền hơn nhưng số lượng ít đi.',
      'Mái tóc và làn da sạch sẽ là bộ trang sức tốt nhất của minimalism.',
      'Tạo điểm nhấn bằng một món phụ kiện có độ tương phản nhỏ.'
    ],
    accessories: [
      'Vòng tay bạc mảnh',
      'Túi Tote da tối giản',
      'Thắt lưng đen trơn',
      'Mũ lưỡi trai không họa tiết'
    ]
  },
  {
    id: 's3',
    name: 'Đường phố',
    icon: 'fa-bolt',
    bannerImage: 'https://images.unsplash.com/photo-1516062423079-7ca13cdc7f5a?auto=format&fit=crop&q=80&w=1000',
    description: 'Streetwear - Sự pha trộn giữa văn hóa hip-hop, trượt ván và thể thao. Đề cao sự thoải mái và cái tôi cá nhân.',
    knowledge: 'Ra đời từ văn hóa Surf và Skate của California, Streetwear đã trở thành văn hóa đại chúng toàn cầu với những cú bắt tay giữa thời trang cao cấp và thể thao.',
    characteristics: [
      'Phom dáng Oversize',
      'Họa tiết Graphic táo bạo',
      'Chất liệu Denim, Cotton dày dặn',
      'Sự hiện diện của Sneakers hiếm'
    ],
    characteristicItems: [
      'Áo Hoodie/Sweatshirt',
      'Quần Cargo (Nhiều túi)',
      'Áo phông Graphic',
      'Giày Jordan hoặc Yeezy'
    ],
    representativeOutfit: {
      name: 'The Urban Legend',
      description: 'Hoodie đen oversize mix cùng quần cargo rằn ri và sneakers hầm hố.',
      image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=600'
    },
    gallery: [
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=400',
      'https://images.unsplash.com/photo-1529139513075-123cf2863eaf?auto=format&fit=crop&q=80&w=400',
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&q=80&w=400'
    ],
    stylingTips: [
      'Đừng ngại thử những mảng màu tương phản mạnh.',
      'Sneakers là linh hồn của bộ đồ, hãy giữ chúng sạch sẽ hoặc có vẻ ngoài "cũ" có chủ ý.',
      'Sử dụng tất cao cổ có họa tiết để tạo điểm nhấn.'
    ],
    accessories: [
      'Mũ Beanie hoặc Snapback',
      'Dây chuyền xích to bản',
      'Vòng tay cao su',
      'Túi đeo chéo (Crossbody bag)'
    ]
  },
  {
    id: 's4',
    name: 'Công sở',
    icon: 'fa-briefcase',
    bannerImage: 'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?auto=format&fit=crop&q=80&w=1000',
    description: 'Business Casual - Sự chuyên nghiệp nhưng vẫn giữ được nét trẻ trung, hiện đại. Phù hợp cho môi trường văn phòng thế kỷ 21.',
    knowledge: 'Từ những bộ Suit cứng nhắc, khái niệm Business Casual ra đời để cân bằng giữa sự tôn trọng và sự thoải mái, sáng tạo trong công việc.',
    characteristics: [
      'Lịch sự nhưng không cứng nhắc',
      'Màu sắc trang nhã (Pastel, Earth tone)',
      'Sự phối hợp giữa đồ Âu và đồ Casual',
      'Độ dài trang phục chuẩn mực'
    ],
    characteristicItems: [
      'Áo sơ mi Oxford',
      'Quần Chinos',
      'Blazer không đệm vai',
      'Giày Chelsea Boot'
    ],
    representativeOutfit: {
      name: 'The Creative Director',
      description: 'Áo cổ lọ đen mặc trong Blazer xám, đi cùng quần vải tối màu.',
      image: 'https://images.unsplash.com/photo-1544441893-675973eabc19?auto=format&fit=crop&q=80&w=600'
    },
    gallery: [
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400',
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400'
    ],
    stylingTips: [
      'Màu xanh navy và xám nhạt là 2 vũ khí lợi hại nhất.',
      'Sơ vin mang lại vẻ ngoài tin cậy hơn trong các cuộc họp.',
      'Giày phải được đánh xi bóng loáng.'
    ],
    accessories: [
      'Thắt lưng da nâu quay đồng',
      'Cặp da văn phòng',
      'Bút ký cài áo',
      'Vớ tối màu'
    ]
  },
  {
    id: 's5',
    name: 'Old Money',
    icon: 'fa-gem',
    bannerImage: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=1000',
    description: 'Phong cách của sự giàu có truyền đời, tập trung vào sự thanh lịch tuyệt đối và các giá trị truyền thống.',
    knowledge: 'Old Money không chỉ là quần áo, mà là sự phản ánh của nền tảng giáo dục và gia thế. Nó đề cao sự bền bỉ của trang phục qua hàng chục năm.',
    characteristics: [
      'Trang phục Polo, dệt kim (Knitwear)',
      'Họa tiết kẻ sọc Tennis',
      'Màu trắng, kem, beige chủ đạo',
      'Sự sạch sẽ và chỉn chu cực độ'
    ],
    characteristicItems: [
      'Áo Polo Pima Cotton',
      'Áo len vắt vai',
      'Váy xếp ly trắng',
      'Giày bệt (Ballerina flats)'
    ],
    representativeOutfit: {
      name: 'Country Club Chic',
      description: 'Áo len kẻ sọc vắt qua vai, mặc cùng polo trắng và quần lửng kaki.',
      image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&q=80&w=600'
    },
    gallery: [
      'https://images.unsplash.com/photo-1520116467321-f149768d288d?auto=format&fit=crop&q=80&w=400',
      'https://images.unsplash.com/photo-1492285822290-3a205ee0a7bb?auto=format&fit=crop&q=80&w=400',
      'https://images.unsplash.com/photo-1537832816519-689ad163238b?auto=format&fit=crop&q=80&w=400'
    ],
    stylingTips: [
      'Chất lượng vải là chìa khóa: Luôn chọn vải tự nhiên.',
      'Giữ cho vẻ ngoài luôn "preppy" - gọn gàng như học sinh trường tư thục.',
      'Hạn chế tối đa các chi tiết trang trí thừa.'
    ],
    accessories: [
      'Đồng hồ dây da mỏng',
      'Kính râm gọng đồi mồi',
      'Dây chuyền vàng mỏng',
      'Túi xách tay Heritage'
    ]
  },
  {
    id: 's6',
    name: 'Vintage',
    icon: 'fa-camera',
    bannerImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=1000',
    description: 'Vintage & Retro - Sự hoài niệm về những thập niên vàng của thời trang. Tôn vinh các giá trị cũ trong bối cảnh hiện đại.',
    knowledge: 'Vintage thường nói về đồ cũ thật sự (trên 20 năm), còn Retro là đồ mới được làm theo phong cách cũ. Cả hai đều tìm kiếm một linh hồn riêng biệt giữa thế giới fast-fashion.',
    characteristics: [
      'Họa tiết chấm bi, kẻ caro lớn',
      'Quần cạp cao, váy xòe',
      'Màu sắc mang hơi hướng sepia, úa vàng',
      'Chất liệu thô mộc, denim cứng'
    ],
    characteristicItems: [
      'Quần Mom Jeans',
      'Váy yếm (Overall)',
      'Áo sơ mi họa tiết 70s',
      'Kính mắt mèo'
    ],
    representativeOutfit: {
      name: 'Retro Sunshine',
      description: 'Váy vàng chấm bi, thắt nơ ở eo phối cùng giày bệt vintage.',
      image: 'https://images.unsplash.com/photo-1515243061678-14fc18b9393c?auto=format&fit=crop&q=80&w=600'
    },
    gallery: [
      'https://images.unsplash.com/photo-1501196354995-1db52d659588?auto=format&fit=crop&q=80&w=400',
      'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80&w=400',
      'https://images.unsplash.com/photo-1516062423079-7ca13cdc7f5a?auto=format&fit=crop&q=80&w=400'
    ],
    stylingTips: [
      'Hãy mix đồ cũ với một món đồ hiện đại để tránh giống như đang mặc lễ phục hóa trang.',
      'Sử dụng khăn Bandana cho tóc hoặc cổ.',
      'Chọn phong cách của một thập niên duy nhất (VD: Preppy những năm 50).'
    ],
    accessories: [
      'Kính mắt gọng nhựa lớn',
      'Túi xách tay đan mây',
      'Trâm cài áo ngọc trai',
      'Mũ Beret'
    ]
  },
  {
    id: 's7',
    name: 'Hàn Quốc',
    icon: 'fa-wand-magic',
    bannerImage: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&q=80&w=1000',
    description: 'K-Style - Sự kết hợp giữa trend thanh lịch và phá cách trẻ trung. Tôn vinh các giá trị và sự ngọt ngào.',
    knowledge: 'Phong cách Hàn Quốc hiện đại chịu ảnh hưởng mạnh từ K-Pop và K-Drama, nhanh chóng update những xu hướng mới nhất từ sàn diễn thế giới.',
    characteristics: [
      'Phối đồ phân tầng (Layering)',
      'Màu sắc Pastel ngọt ngào',
      'Quần ống rộng (Wide-leg pants)',
      'Tỉ lệ lưng ngắn chân dài'
    ],
    characteristicItems: [
      'Áo Cardigan mỏng',
      'Chân váy chữ A',
      'Áo Blazer oversize nhẹ',
      'Túi kẹp nách'
    ],
    representativeOutfit: {
      name: 'Seoul Street Vibe',
      description: 'Áo gile dệt kim mặc ngoài sơ mi trắng, phối cùng quần suông và túi tote.',
      image: 'https://images.unsplash.com/photo-1536766820879-059fec98ec0a?auto=format&fit=crop&q=80&w=600'
    },
    gallery: [
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=400',
      'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&q=80&w=400',
      'https://images.unsplash.com/photo-1495385794356-15371f348c31?auto=format&fit=crop&q=80&w=400'
    ],
    stylingTips: [
      'Sử dụng vớ cao cổ trắng với mọi loại giày.',
      'Màu tóc thời trang là một phần không thể thiếu của K-style.',
      'Cách layer áo cổ lọ bên trong sơ mi đặc trưng cho mùa thu đông.'
    ],
    accessories: [
      'Kẹp tóc nơ lớn',
      'Mũ nồi (Beret)',
      'Túi vải Canvas',
      'Hoa tai nhựa màu'
    ]
  },
  {
    id: 's8',
    name: 'Techwear',
    icon: 'fa-microchip',
    bannerImage: 'https://images.unsplash.com/photo-1550009158-9df200150245?auto=format&fit=crop&q=80&w=1000',
    description: 'Phong cách vị lai (Futuristic) kết hợp công nghệ. Đề cao tính năng, độ bền và vẻ ngoài viễn tưởng.',
    knowledge: 'Techwear ra đời từ nhu cầu về trang phục có thể chống chọi với thời tiết khắc nghiệt trong thành phố, sử dụng các loại vải chống nước, co giãn 4 chiều.',
    characteristics: [
      'Vải chống thấm (Gore-Tex)',
      'Hệ thống túi modular',
      'Màu đen đặc trưng (All black)',
      'Chi tiết khóa kéo, dây đai chéo'
    ],
    characteristicItems: [
      'Áo khoác Shell Jacket',
      'Quần Cargo Parachute',
      'Khẩu trang/Mặt nạ công nghệ',
      'Giày bốt combat'
    ],
    representativeOutfit: {
      name: 'Shadow Runner',
      description: 'Cây đen toàn tập với áo khoác nhiều túi và quần jogger chống nước.',
      image: 'https://images.unsplash.com/photo-1624224971170-2f84fed5eb5e?auto=format&fit=crop&q=80&w=600'
    },
    gallery: [
      'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&q=80&w=400',
      'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=400',
      'https://images.unsplash.com/photo-1516062423079-7ca13cdc7f5a?auto=format&fit=crop&q=80&w=400'
    ],
    stylingTips: [
      'Chất liệu hơn là kiểu dáng. Hãy đầu tư vào vải Gore-tex thật sự.',
      'Sử dụng thắt lưng quân đội hoặc thắt lưng quick-release.',
      'Giữ cho các đường cắt gọn gàng để trông không bị quá rườm rà.'
    ],
    accessories: [
      'Balo chống nước',
      'Găng tay hở ngón',
      'Thắt lưng Cobra',
      'Đồng hồ thông minh hầm hố'
    ]
  }
];

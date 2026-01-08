-- Seed data

INSERT INTO Users (username, password, role) VALUES 
('staff', 'staff123', 'staff'),
('reader', 'reader123', 'reader');

INSERT INTO Books (isbn, title, author, publisher, publication_date, description, status) VALUES 
('978-7-111-54493-7', '深入理解计算机系统', 'Randal E. Bryant', '机械工业出版社', '2016-11-01', '程序员必读经典', 'available'),
('978-7-115-54608-1', 'JavaScript高级程序设计', 'Matt Frisbie', '人民邮电出版社', '2020-09-01', '前端红宝书', 'available'),
('978-7-302-42328-7', '算法导论', 'Thomas H. Cormen', '清华大学出版社', '2013-01-01', '算法领域的圣经', 'available');

require 'open-uri'
require 'nokogiri'
require 'json'


$days = ['mon','tue','wed','thu','fri','sat']
def makeFile()
	indexURL = "http://msgsot.sic.shibaura-it.ac.jp/cancel.html"
	doc = Nokogiri::HTML(open(indexURL))
	lData = {};
	lData[0] = []
	lData[1] = []
	lData[2] = []
	doc.css('a').each do |link|
		if link.text.include?('*工学部')
			lData[0].push(URI.join(indexURL,link['href'][1..-9]).to_s + "week.html")
		elsif link.text.include?('*ｼｽﾃﾑ理工学部')
			lData[1].push(URI.join(indexURL,link['href'][1..-9]).to_s + "week.html")
		elsif link.text.include?('*ﾃﾞｻﾞｲﾝ工学部')
			lData[2].push(URI.join(indexURL,link['href'][1..-9]).to_s + "week.html")		
		end
	end
	File.open("list.json", "w") do |file|
		file.print(JSON.generate(lData))
	end
	puts "休講データの生成が完了しました。"
end

makeFile()



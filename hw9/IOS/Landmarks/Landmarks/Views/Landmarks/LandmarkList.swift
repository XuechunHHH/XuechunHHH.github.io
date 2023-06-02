//
//  LandmarkList.swift
//  Landmarks
//
//  Created by mac on 4/7/23.
//

import SwiftUI

struct LandmarkList: View {
    @EnvironmentObject var modelData: ModelData
    @State private var showFavoritesOnly = false
    
    var filteredLandmarks: [Landmark]{
        modelData.landmarks.filter{
            landmark in
            (!showFavoritesOnly || landmark.isFavorite)
        }
    }
    
    var body: some View {
        NavigationView {
            List {
                Toggle("Favorites only", isOn: $showFavoritesOnly)
                
                ForEach (filteredLandmarks){
                    landmark in
                    NavigationLink{
                        LandmarkDetail(landmark: landmark)
                    }
                    label: {
                        LandmarkRow(landmark: landmark)
                    }
                }
                .navigationTitle("Landmarks")
            }
        }
    }
}

struct LandmarkList_Previews: PreviewProvider {
    static var previews: some View {
        LandmarkList()
            .environmentObject(ModelData())
    }
}
